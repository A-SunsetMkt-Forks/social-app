import React from 'react'
import {View} from 'react-native'
import {AppBskyActorDefs, AppBskyGraphDefs, AtUri} from '@atproto/api'
import {Trans} from '@lingui/macro'
import {useQueryClient} from '@tanstack/react-query'

import {sanitizeHandle} from 'lib/strings/handles'
import {precacheList} from 'state/queries/feed'
import {useTheme} from '#/alf'
import {atoms as a} from '#/alf'
import {Action, Avatar, Description, Header, Outer} from '#/components/FeedCard'
import {Link as InternalLink, LinkProps} from '#/components/Link'
import {Text} from '#/components/Typography'

/*
 * This component is based on `FeedCard` and is tightly coupled with that
 * component. Please refer to `FeedCard` for more context.
 */

export {
  Action,
  Avatar,
  AvatarPlaceholder,
  Description,
  Header,
  Outer,
  TitleAndBylinePlaceholder,
} from '#/components/FeedCard'

type Props = {
  view: AppBskyGraphDefs.ListView
  showPinButton?: boolean
}

export function Default(props: Props) {
  const {view, showPinButton} = props
  return (
    <Link label={view.name} {...props}>
      <Outer>
        <Header>
          <Avatar src={view.avatar} />
          <TitleAndByline title={view.name} creator={view.creator} />
          {showPinButton && <Action uri={view.uri} pin type="list" />}
        </Header>
        <Description description={view.description} />
      </Outer>
    </Link>
  )
}

export function Link({
  view,
  children,
  ...props
}: Props & Omit<LinkProps, 'to'>) {
  const queryClient = useQueryClient()

  const href = React.useMemo(() => {
    return createProfileListHref({list: view})
  }, [view])

  React.useEffect(() => {
    precacheList(queryClient, view)
  }, [view, queryClient])

  return (
    <InternalLink to={href} {...props}>
      {children}
    </InternalLink>
  )
}

export function TitleAndByline({
  title,
  creator,
}: {
  title: string
  creator?: AppBskyActorDefs.ProfileViewBasic
}) {
  const t = useTheme()

  return (
    <View style={[a.flex_1]}>
      <Text style={[a.text_md, a.font_bold, a.leading_snug]} numberOfLines={1}>
        {title}
      </Text>
      {creator && (
        <Text
          style={[a.leading_snug, t.atoms.text_contrast_medium]}
          numberOfLines={1}>
          <Trans>List by {sanitizeHandle(creator.handle, '@')}</Trans>
        </Text>
      )}
    </View>
  )
}

export function createProfileListHref({
  list,
}: {
  list: AppBskyGraphDefs.ListView
}) {
  const urip = new AtUri(list.uri)
  const handleOrDid = list.creator.handle || list.creator.did
  return `/profile/${handleOrDid}/lists/${urip.rkey}`
}
