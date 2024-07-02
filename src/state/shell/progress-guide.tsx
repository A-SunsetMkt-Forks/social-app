import React from 'react'
import {msg} from '@lingui/macro'
import {useLingui} from '@lingui/react'

import {
  ProgressGuideToast,
  ProgressGuideToastRef,
} from '#/components/ProgressGuide/Toast'
import {useSetActiveProgressGuideMutation} from '../queries/preferences'

export enum ProgressGuideAction {
  Like = 'like',
  Follow = 'follow',
}

type ProgressGuideName = 'like-10-and-follow-7'

interface BaseProgressGuide {
  guide: string
  isComplete: boolean
  [key: string]: any
}

interface Like10AndFollow7ProgressGuide extends BaseProgressGuide {
  numLikes: number
  numFollows: number
}

type ProgressGuide = Like10AndFollow7ProgressGuide | undefined

const ProgressGuideContext = React.createContext<ProgressGuide>(undefined)

const ProgressGuideControlContext = React.createContext<{
  startProgressGuide(guide: ProgressGuideName): void
  endProgressGuide(): void
  captureAction(action: ProgressGuideAction, count?: number): void
}>({
  startProgressGuide: (_guide: ProgressGuideName) => {},
  endProgressGuide: () => {},
  captureAction: (_action: ProgressGuideAction, _count = 1) => {},
})

export function useProgressGuide(guide: ProgressGuideName) {
  const ctx = React.useContext(ProgressGuideContext)
  if (ctx?.guide === guide) {
    return ctx
  }
  return undefined
}

export function useProgressGuideControls() {
  return React.useContext(ProgressGuideControlContext)
}

export function Provider({children}: React.PropsWithChildren<{}>) {
  const {_} = useLingui()
  const {mutate} = useSetActiveProgressGuideMutation()

  const [activeProgressGuide, setActiveProgressGuide] =
    React.useState<ProgressGuide>({
      guide: 'like-10-and-follow-7',
      numLikes: 0,
      numFollows: 0,
      isComplete: false,
    })

  const firstLikeToastRef = React.useRef<ProgressGuideToastRef | null>(null)
  const fifthLikeToastRef = React.useRef<ProgressGuideToastRef | null>(null)
  const tenthLikeToastRef = React.useRef<ProgressGuideToastRef | null>(null)

  const controls = React.useMemo(() => {
    return {
      startProgressGuide(guide: ProgressGuideName) {
        if (guide === 'like-10-and-follow-7') {
          const guideObj = {
            guide: 'like-10-and-follow-7',
            numLikes: 0,
            numFollows: 0,
            isComplete: false,
          }
          mutate(guideObj)
          setActiveProgressGuide(guideObj)
        }
      },

      endProgressGuide() {
        mutate(undefined)
        setActiveProgressGuide(undefined)
      },

      captureAction(action: ProgressGuideAction, count = 1) {
        let guide = activeProgressGuide
        if (guide?.isComplete) {
          return
        }
        if (guide?.guide === 'like-10-and-follow-7') {
          if (action === ProgressGuideAction.Like) {
            guide = {
              ...guide,
              numLikes: (guide.numLikes || 0) + count,
            }
            if (guide.numLikes === 1) {
              firstLikeToastRef.current?.open()
            }
            if (guide.numLikes === 5) {
              fifthLikeToastRef.current?.open()
            }
            if (guide.numLikes === 10) {
              tenthLikeToastRef.current?.open()
            }
          }
          if (action === ProgressGuideAction.Follow) {
            guide = {
              ...guide,
              numFollows: (guide.numFollows || 0) + count,
            }
          }
          if (guide.numLikes >= 10 && guide.numFollows >= 7) {
            tenthLikeToastRef.current?.open()
            guide = {
              ...guide,
              isComplete: true,
            }
          }
        }
        mutate(guide?.isComplete ? undefined : guide)
        setActiveProgressGuide(guide)
      },
    }
  }, [activeProgressGuide, setActiveProgressGuide, mutate])

  return (
    <ProgressGuideContext.Provider value={activeProgressGuide}>
      <ProgressGuideControlContext.Provider value={controls}>
        {children}
        <ProgressGuideToast
          ref={firstLikeToastRef}
          title={_(msg`Your first like!`)}
          subtitle={_(msg`Like 10 posts to train the Discover feed`)}
        />
        <ProgressGuideToast
          ref={fifthLikeToastRef}
          title={_(msg`Half way there!`)}
          subtitle={_(msg`Like 10 posts to train the Discover feed`)}
        />
        <ProgressGuideToast
          ref={tenthLikeToastRef}
          title={_(msg`Task complete - 10 likes!`)}
          subtitle={_(msg`The Discover feed now knows what you like`)}
        />
      </ProgressGuideControlContext.Provider>
    </ProgressGuideContext.Provider>
  )
}
