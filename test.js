import fs from 'fs'
import path from 'path'
import os from 'os'
import { create } from 'ipfs'
import { CID } from 'multiformats/cid'
import crypto from 'crypto'
import { of as hashOf } from './index.js'

describe('Hash Calculation Tests', () => {
  test('should calculate the IPFS hash of a buffer', async () => {
    const data = Buffer.from('hello world\n')
    const hash = await hashOf(data)
    expect(hash).toBe('QmT78zSuBmuS4z925WZfrqQ1qHaJ56DQaTfyMUF7F8ff5o')
  })

  test('should calculate the IPFS hash of a string', async () => {
    const data = 'hello world\n'
    const hash = await hashOf(data)
    expect(hash).toBe('QmT78zSuBmuS4z925WZfrqQ1qHaJ56DQaTfyMUF7F8ff5o')
  })

  test('should calculate the IPFS hash of an async iterator', async () => {
    const stream = fs.createReadStream(path.join(path.dirname(new URL(import.meta.url).pathname), 'hello'))
    const hash = await hashOf(stream)
    expect(hash).toBe('QmT78zSuBmuS4z925WZfrqQ1qHaJ56DQaTfyMUF7F8ff5o')
  })

  test('should produce the same hash as IPFS', async () => {
    const datas = [
      Buffer.from('TEST' + Date.now()),
      crypto.randomBytes(1024 * 1024 * 15)
    ]
    const ipfs = await create({ repo: path.join(os.tmpdir(), `${Date.now()}`) })

    for (const data of datas) {
      const { cid } = await ipfs.add(data)
      const hash = await hashOf(data)
      expect(cid.toString()).toBe(hash)
    }

    await ipfs.stop()
  })

  test('should take CID version option', async () => {
    const data = Buffer.from('TEST' + Date.now())
    const hash = await hashOf(data, { cidVersion: 1 })
    const cid = CID.parse(hash)
    expect(cid.version).toBe(1)
  })
})
