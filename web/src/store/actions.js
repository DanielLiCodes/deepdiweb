import * as api from '../api/oda'

import { Realtime } from '../realtime'
import * as types from './mutation-types'
import _ from 'lodash'
import { bus, NOTIFY } from '../bus'
import { buildDUs, buildParcels } from '../lib/lib'

function sendRealtimeUpdate (msg, payload) {
  if (Realtime.realtime) {
    Realtime.realtime.emit(msg, payload)
  }
}

function commitAndSendRealtimeUpdate ({ commit, state }, msg, payload) {
  commit(msg, payload)
  payload.user = _.get(state, 'user.username')
  payload.timestamp = new Date()
  sendRealtimeUpdate(msg, payload)
}

export async function loadOdbFile ({ commit, state }) {
  const odbFile = await api.loadOdbFile()
  let disassemblyTask
  let disassemblyTaskRetdec
  let data, transfer
  let functions
  let baseAdd
  let binary
  let functionsParsed
  const func = {}
  if (odbFile.disassembly_data !== undefined) {
    const disassemblyData = odbFile.disassembly_data
    data = disassemblyData.data
    transfer = disassemblyData.transfer
    functions = _.keyBy(disassemblyData.functions, 'vma_start')
    functionsParsed = disassemblyData.functions
    baseAdd = disassemblyData.base_add
    state.binaryBytes = disassemblyData.binaryBytes
    if (odbFile.isexe) {
      // cCode = resp.cCode
      odbFile.binary.base_address = Number(baseAdd)
      for (const [key, value] of Object.entries(functions)) {
        value.cmd_vmas.forEach((val) => {
          func[val] = functions[key]
        })
      }
    }
  } else {
    bus.$emit(NOTIFY, {
      text: 'Disassembling...'
    })

    if (odbFile.live_mode) {
      disassemblyTask = api.disassembleBytes({
        bytes: odbFile.binary.text,
        arch: odbFile.binary.options.architecture,
        mode: odbFile.binary.options.endian
      })
      // HERE if odb already from database, skip these and pull data after from odbFile disassemblyData
    } else if (odbFile.isexe) {
      disassemblyTaskRetdec = api.disassembleByRetdec(state.shortName)
    } else {
      disassemblyTask = api.disassemble(state.shortName)
    }
    // HERE also if odbFile.diassembly_data is none
    if (odbFile.isexe) {
      const resp = await disassemblyTaskRetdec
      binary = resp.binary
      data = binary.data
      transfer = binary.transfer
      functions = _.keyBy(binary.functions, 'vma_start')
      functionsParsed = binary.functions
      // cCode = resp.cCode
      baseAdd = resp.base_add
      odbFile.binary.base_address = Number(resp.base_add)
      for (const [key, value] of Object.entries(functions)) {
        value.cmd_vmas.forEach((val) => {
          func[val] = functions[key]
        })
      }
    } else {
      const resp = await disassemblyTask
      data = resp.data
      transfer = resp.transfer
    }
  }

  // we can do some local parsing while we wait for disassembly to finish
  // find strings (any contiguous sequence of more than 4 ascii characters)
  const strings = []
  const currString = { addr: 0, string: '' }
  for (let i = 0; i < state.binaryBytes.length; i++) {
    const char = state.binaryBytes[i]
    if (char >= 0x20 && char <= 0x7e) {
      if (currString.string === '') currString.addr = odbFile.binary.base_address + i
      currString.string += String.fromCharCode(char)
    } else {
      if (currString.string.length > 4) { strings.push(Object.assign({}, currString)) }
      currString.string = ''
    }
  }
  if (currString.string.length > 4) { strings.push(currString) }
  strings.push(currString)
  odbFile.strings = strings

  // let cCode

  bus.$emit(NOTIFY, {
    text: 'Parsing disassembling...'
  })
  // parse branches
  // deepdi returns { <dec_address: String>: [ if_taken, next_instr ] }[]
  // frontend needs { srcAddr, targetAddr }[]

  const branches = []
  transfer.forEach((ele) => {
    branches.push({
      srcAddr: Number(ele.start) + odbFile.binary.base_address,
      targetAddr: ele.destination + odbFile.binary.base_address
    })
  })
  // console.log()
  // for (const [address, branchTargets] of Object.entries(transfer)) {
  //   branches.push({
  //     srcAddr: Number(address) + odbFile.binary.base_address,
  //     targetAddr: branchTargets[0] + odbFile.binary.base_address
  //   })
  // }
  odbFile.branches = branches
  odbFile.functions = functions
  // parse dus
  const allDus = buildDUs(state, odbFile, { data, branches })

  // populate vma to lda store
  const vmaToLda = new Map()
  for (let i = 0; i < allDus.length; i++) {
    vmaToLda.set(allDus[i].vma, i)
  }

  commit(types.LOAD_ODBFILE, {
    odbFile,
    allDus,
    vmaToLda,
    func,
    functions
  })

  commit(types.SET_PARCELS, {
    parcels: buildParcels(allDus, vmaToLda, branches.map(x => x.targetAddr))
  })

  commit(types.SET_BRANCHES, {
    branches: odbFile.branches
  })

  // if (realtime) {
  //   realtime.close()
  // }

  // realtime = new Realtime('http://localhost:8080')
  if (odbFile.disassembely_data === undefined) {
    odbFile.disassembly_data = {
      data: data,
      transfer: transfer,
      base_add: baseAdd === undefined ? 0 : baseAdd,
      binaryBytes: Array.from(state.binaryBytes),
      functions: functionsParsed
    }
    let email
    try {
      const temp = await api.validate(localStorage.token)
      email = temp.decoded.email
    } catch (e) {
      console.log('expired lulw')
    }
    await api.loadOdbFiletoDatabase(odbFile, state.shortName, email)
  }

  bus.$emit('doneLoading', 'done loading file')
}

export async function disassembleByRetdecFunction ({ commit, state }, func) {
  const cCode = await api.disassembleByRetdecFuncRanges(state.shortName, func)
  if (cCode !== '') {
    state.cCode = cCode
    bus.$emit(NOTIFY, {
      text: 'Finished C Disassembly!'
    })
  }
}

export function loadDu ({ commit, state }, { addr, units }) {
  // console.log('loadDu', addr, units)
  // const slice = _.slice(state.displayUnits, addr, addr + units)
  // if (slice.length > 0 && _.every(slice) && slice.length === units) {
  //   return Q.resolve(slice)
  // }

  // return api.loadDisplayUnits(addr, units).then((displayUnits) => {
  //   commit(types.CACHE_DISPLAYUNITS, {
  //     start: addr,
  //     displayUnits: displayUnits
  //   })
  //   return displayUnits
  // })
}

export async function clearDisplayUnits ({ commit, state }, { addr }) {
  // const lda = await api.vmaToLda(addr)
  // const start = Math.max(0, lda - 250)
  // const displayUnits = await api.loadDisplayUnits(start, 600)

  // api.loadBranches().then((branches) => {
  //   commit(types.SET_BRANCHES, {
  //     branches: branches
  //   })
  // })

  // commitAndSendRealtimeUpdate({ commit, state }, types.CLEAR_AND_SET_DISPLAYUNITS, {
  //   start: start,
  //   displayUnits: displayUnits
  // })
}

export async function setBinaryText ({ commit, state, dispatch }, { binaryText }) {
  // await api.setBinaryText(binaryText)

  // commit(types.SET_BINARYTEXT, {
  //   binaryText
  // })

  // dispatch('clearDisplayUnits', { addr: 0 })
  // return true
}

export async function setBinaryOptions ({ commit, state, dispatch }, { architecture, baseAddress, endian, selectedOpts }) {
  // await api.setBinaryOptions(architecture, baseAddress, endian, selectedOpts)
  // commit(types.SET_BINARYOPTIONS, { architecture, baseAddress, endian, selectedOpts })
  // dispatch('clearDisplayUnits', { addr: 0 })
  // return true
}

export async function dataToCode ({ commit, state, dispatch }, { addr }) {
  // await api.dataToCode(addr)
  // const parcels = await api.loadParcels()
  // commitAndSendRealtimeUpdate({ commit, state }, types.SET_PARCELS, { parcels })
  // dispatch('clearDisplayUnits', { addr: addr })
}

export async function codeToData ({ commit, state, dispatch }, { addr }) {
  // await api.codeToData(addr)
  // const parcels = await api.loadParcels()
  // commitAndSendRealtimeUpdate({ commit, state }, types.SET_PARCELS, { parcels })
  // dispatch('clearDisplayUnits', { addr: addr })
}

export async function addComment ({ commit, state }, { comment, vma }) {
  // await api.makeComment(comment, vma)
  // commitAndSendRealtimeUpdate({ commit, state }, types.MAKE_COMMENT, { comment, vma })
}

export async function setDefaultSharingLevel ({ commit, state }, { permissionLevel }) {
  // await api.setDefaultPermissionLevel(permissionLevel)
  // commit(types.SET_DEFAULT_PERMISSION_LEVEL, { permissionLevel })
}

export function updateUserPosition ({ commit, state }, { username, address }) {
  // commit(types.UPDATE_USER_POSITION, { username, address })
}

export async function createString ({ commit, state, dispatch }, { addr }) {
  // await api.createDefinedData(addr, 'builtin', 'ascii', 'string_' + addr.toString(16))
  // dispatch('clearDisplayUnits', { addr: addr })
}

export async function undefineData ({ commit, state, dispatch }, { addr }) {
  // await api.undefineData(addr)
  // dispatch('clearDisplayUnits', { addr: addr })
}

export async function createStructDefinedData ({ commit, state, dispatch }, { addr, varName, structName }) {
  // await api.createDefinedData(addr, 'struct', structName, varName)
  // dispatch('clearDisplayUnits', { addr: addr })
}

export function generateFuncsDict (functions) {
  const func = {}
  for (const [key, value] of Object.entries(functions)) {
    value.cmd_vmas.forEach((val) => {
      func[val] = functions[key]
    })
  }
  return func
}

export async function upsertFunction ({ commit, state }, { vma, name, retval, args }) {
  const f = state.funcs[vma]
  if (f) {
    await api.updateFunction(vma, name, retval, args)
  } else {
    await api.createFunction(vma, name, retval, args)
  }

  commitAndSendRealtimeUpdate({ commit, state }, types.UPDATE_FUNCTION, { vma, name, retval, args })
}

export async function addStruct ({ commit, state }, { name }) {
  // await api.createStructure(name)
  // commit(types.ADD_STRUCTURE, { name })
}

export async function deleteStruct ({ commit, state }, { index }) {
  // await api.deleteStructure(index)
  // commit(types.DELETE_STRUCT, { index: index })
}

export async function updateStruct ({ commit, state }, { index, struct }) {
  // await api.updateStructure(index, struct)
}

export async function login ({ commit, state }, { username, password }) {
  // await auth.login(username, password)
  // const whoami = auth.whoami()
  // commit(types.UPDATE_USER, { user: whoami })
  // return whoami
}
