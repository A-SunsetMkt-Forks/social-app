import React from 'react'
import {
  StyleProp,
  StyleSheet,
  TouchableOpacity,
  View,
  ViewStyle,
} from 'react-native'
import {FontAwesomeIcon} from '@fortawesome/react-native-fontawesome'
import {HeaderBackButton} from '@react-navigation/elements'
import {useNavigation} from '@react-navigation/native'

import {isAndroid, isWeb} from '#/platform/detection'
import {useSetDrawerOpen} from '#/state/shell'
import {useAnalytics} from 'lib/analytics/analytics'
import {usePalette} from 'lib/hooks/usePalette'
import {useWebMediaQueries} from 'lib/hooks/useWebMediaQueries'
import {NavigationProp} from 'lib/routes/types'
import {ios, useTheme} from '#/alf'
import {Menu_Stroke2_Corner0_Rounded as Menu} from '#/components/icons/Menu'
import {CenteredView} from './Views'

const BACK_HITSLOP = {left: 20, top: 20, right: 50, bottom: 20}

export function SimpleViewHeader({
  showBackButton = true,
  style,
  children,
}: React.PropsWithChildren<{
  showBackButton?: boolean
  style?: StyleProp<ViewStyle>
}>) {
  const pal = usePalette('default')
  const setDrawerOpen = useSetDrawerOpen()
  const navigation = useNavigation<NavigationProp>()
  const {track} = useAnalytics()
  const {isMobile} = useWebMediaQueries()
  const t = useTheme()
  const canGoBack = navigation.canGoBack()

  const onPressBack = React.useCallback(() => {
    if (navigation.canGoBack()) {
      navigation.goBack()
    } else {
      navigation.navigate('Home')
    }
  }, [navigation])

  const onPressMenu = React.useCallback(() => {
    track('ViewHeader:MenuButtonClicked')
    setDrawerOpen(true)
  }, [track, setDrawerOpen])

  const Container = isMobile ? View : CenteredView
  return (
    <Container
      style={[
        styles.header,
        isMobile && styles.headerMobile,
        isWeb && styles.headerWeb,
        pal.view,
        style,
      ]}>
      {showBackButton ? (
        isWeb || !canGoBack ? (
          <TouchableOpacity
            testID="viewHeaderDrawerBtn"
            onPress={canGoBack ? onPressBack : onPressMenu}
            hitSlop={BACK_HITSLOP}
            style={canGoBack ? styles.backBtn : styles.backBtnWide}
            accessibilityRole="button"
            accessibilityLabel={canGoBack ? 'Back' : 'Menu'}
            accessibilityHint="">
            {canGoBack ? (
              <FontAwesomeIcon
                size={18}
                icon="angle-left"
                style={[styles.backIcon, pal.text]}
              />
            ) : (
              <Menu size="lg" style={[{marginTop: 4}, pal.textLight]} />
            )}
          </TouchableOpacity>
        ) : (
          <View style={styles.nativeBackBtn}>
            <HeaderBackButton
              onPress={onPressBack}
              labelVisible={false}
              tintColor={t.atoms.text.color}
              style={ios({transform: [{scale: 0.8}]})}
            />
          </View>
        )
      ) : null}
      {children}
    </Container>
  )
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingVertical: 12,
    width: '100%',
  },
  headerMobile: {
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  headerWeb: {
    // @ts-ignore web-only
    position: 'sticky',
    top: 0,
    zIndex: 1,
  },
  backBtn: {
    width: 30,
    height: 30,
  },
  backBtnWide: {
    width: 30,
    height: 30,
    paddingLeft: 4,
    marginRight: 4,
  },
  backIcon: {
    marginTop: 6,
  },
  nativeBackBtn: {
    width: 30,
    height: 30,
    marginRight: isAndroid ? 12 : 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
})
