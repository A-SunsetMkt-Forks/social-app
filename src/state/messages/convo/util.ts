import {ConvoState, ConvoStatus} from './types'

/**
 * Checks if a `Convo` has a `status` that is "active", meaning the chat is
 * loaded and ready to be used, or its in a suspended or background state, and
 * ready for resumption.
 */
export function isConvoActive(convo: ConvoState) {
  return (
    convo.status === ConvoStatus.Ready ||
    convo.status === ConvoStatus.Backgrounded ||
    convo.status === ConvoStatus.Suspended
  )
}
