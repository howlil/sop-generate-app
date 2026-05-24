import { extractDbInvariantMessage } from './prisma-db-invariant.util'

describe('extractDbInvariantMessage', () => {
  it('should_extract_message_from_driver_adapter_error_shape', () => {
    const err = {
      name: 'DriverAdapterError',
      cause: {
        originalCode: '1644',
        originalMessage:
          'Relasi SOP terkait sudah ada arah terbalik; hapus pasangan yang ada terlebih dahulu',
        kind: 'mysql',
        code: 1644,
        message:
          'Relasi SOP terkait sudah ada arah terbalik; hapus pasangan yang ada terlebih dahulu',
        state: '45000',
      },
    }
    const actual = extractDbInvariantMessage(err)
    expect(actual).toBe(
      'Relasi SOP terkait sudah ada arah terbalik; hapus pasangan yang ada terlebih dahulu',
    )
  })

  it('should_return_null_for_unrelated_errors', () => {
    expect(extractDbInvariantMessage(new Error('network timeout'))).toBeNull()
    expect(extractDbInvariantMessage({ message: 'not found' })).toBeNull()
  })

  it('should_extract_self_loop_sop_terkait_message', () => {
    const err = {
      message: 'SOP terkait tidak boleh merujuk diri sendiri',
      state: '45000',
    }
    expect(extractDbInvariantMessage(err)).toBe(
      'SOP terkait tidak boleh merujuk diri sendiri',
    )
  })
})
