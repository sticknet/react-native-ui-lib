// TODO: support commented props
import React, { useMemo } from 'react';
import _ from 'lodash';
import { useAnimatedReaction, useSharedValue, withTiming, runOnJS } from 'react-native-reanimated';
import { Constants } from "../../helpers";
import { asBaseComponent } from "../../commons/new";
import TabBarContext from "./TabBarContext";
import TabBar from "./TabBar";
import TabBarItem, { TabControllerItemProps } from "./TabBarItem";
import TabPage from "./TabPage";
import PageCarousel from "./PageCarousel";
export { TabControllerItemProps }; // TODO: should migrate selectedIndex to initialIndex (and make this prop uncontrolled)

/**
 * @description: A performant solution for a tab controller with lazy load mechanism
 * @example: https://github.com/wix/react-native-ui-lib/blob/master/demo/src/screens/componentScreens/TabControllerScreen/index.tsx
 * @notes: This component is based on react-native-gesture-handler
 * @important: On Android, if using react-native-navigation, make sure to wrap your screen with gestureHandlerRootHOC
 * @importantLink: https://kmagiera.github.io/react-native-gesture-handler/docs/getting-started.html#with-wix-react-native-navigation-https-githubcom-wix-react-native-navigation
 */
function TabController({
  selectedIndex = 0,
  asCarousel = false,
  items = [],
  onChangeIndex = _.noop,
  carouselPageWidth,
  children
}) {
  const pageWidth = useMemo(() => {
    return carouselPageWidth || Constants.screenWidth;
  }, [carouselPageWidth]);
  const ignoredItems = useMemo(() => {
    return _.filter(items, item => item.ignore);
  }, [items]);
  /* currentPage - static page index */

  const currentPage = useSharedValue(selectedIndex);
  /* targetPage - transitioned page index (can be a fraction when transitioning between pages) */

  const targetPage = useSharedValue(selectedIndex);
  const carouselOffset = useSharedValue(selectedIndex * Math.round(pageWidth));
  const containerWidth = useSharedValue(pageWidth);
  useAnimatedReaction(() => {
    return currentPage.value;
  }, (value, prevValue) => {
    if (value !== prevValue) {
      targetPage.value = withTiming(value);
      prevValue !== null && runOnJS(onChangeIndex)(value, prevValue);
    }
  });
  const context = useMemo(() => {
    return {
      /* Pass Props */
      selectedIndex,
      asCarousel,
      pageWidth,

      /* Items */
      items,
      ignoredItems,

      /* Animated Values */
      targetPage,
      currentPage,
      carouselOffset,
      containerWidth,

      /* Callbacks */
      onChangeIndex
    };
  }, [
  /* selectedIndex,*/
  asCarousel, items, onChangeIndex]);

  if (items.length === 0) {
    return null;
  }

  return <TabBarContext.Provider value={context}>{children}</TabBarContext.Provider>;
}

TabController.TabBar = TabBar;
TabController.TabBarItem = TabBarItem;
TabController.TabPage = TabPage;
TabController.PageCarousel = PageCarousel;
export default asBaseComponent(TabController);