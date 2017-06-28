/**
 * Copyright 2015-2017 aixigo AG
 * Released under the MIT license.
 * http://laxarjs.org/license
 */
import * as $ from 'jquery';
import debounce from 'lodash.debounce';

export const name = 'axShowHideWidgetDirective';

const STATE = 'axShowHideWidgetDirectiveState';
const RESIZE_DELAY = 25;

//////////////////////////////////////////////////////////////////////////////////////////////////////////////

export function create() {
   return [ '$window', 'axVisibilityService', ( $window, visibilityService ) => {
      return {
         restrict: 'A',
         link( scope, element, attrs ) {

            const jqElement = $( element[ 0 ] );
            const options = scope.$eval( attrs[ name ] );

            let show;
            let hide;
            if( options.animationsEnabled ) {
               show = () => {
                  jqElement.css( 'display', 'block' );
                  const height = calculateContentHeight( jqElement );
                  animateToHeight( jqElement, height );
               };
               hide = () => {
                  animateToHeight( jqElement, 0 );
               };
            }
            else {
               show = () => { jqElement.show(); };
               hide = () => { jqElement.hide(); };
            }

            const fixContainerSize = debounce( fixContainerSizeNow, RESIZE_DELAY );

            let widgetIsVisible;
            let showContent;
            let currentTargetHeight = 0;

            handleStateChange( scope.$eval( attrs[ STATE ] ) );
            scope.$watch( attrs[ STATE ], handleStateChange );

            visibilityService.handlerFor( scope ).onChange( handleWidgetVisibilityChange );

            //////////////////////////////////////////////////////////////////////////////////////////////////

            function handleStateChange( newShowContent ) {
               if( showContent === newShowContent ) {
                  return;
               }
               if( newShowContent ) {
                  if( showContent === undefined ) {
                     // initial show: no animations
                     jqElement.show();
                  }
                  else {
                     show();
                     if( options.animationsEnabled && widgetIsVisible ) {
                        startWatchingForContentResizing();
                     }
                  }
               }
               else {
                  hide();
                  stopWatchingForContentResizing();
               }
               showContent = newShowContent;
            }

            //////////////////////////////////////////////////////////////////////////////////////////////////

            function handleWidgetVisibilityChange( newVisible, previousVisible ) {
               widgetIsVisible = newVisible;
               if( newVisible && previousVisible === false && showContent && options.animationsEnabled ) {
                  startWatchingForContentResizing();
               }
               else {
                  stopWatchingForContentResizing();
               }
            }

            //////////////////////////////////////////////////////////////////////////////////////////////////

            function fixContainerSizeNow() {
               if( !showContent || !scope.isVisible ) { return; }
               let contentHeight = 0;
               jqElement.children().each( ( index, child ) => {
                  contentHeight += $( child ).outerHeight( true );
               } );
               if( contentHeight !== currentTargetHeight ) {
                  animateToHeight( jqElement, contentHeight );
                  // if this widget contains another animated widget (such as another AxShowHideWidget),
                  // make sure to pick up on its animated content
                  $window.setTimeout( fixContainerSize, RESIZE_DELAY );
               }
            }

            //////////////////////////////////////////////////////////////////////////////////////////////////

            let clearWatcher;
            function startWatchingForContentResizing() {
               if( !clearWatcher ) {
                  clearWatcher = scope.$watch( () => {
                     fixContainerSize();
                     // if this widget contains another animated widget (such as another AxShowHideWidget),
                     // make sure to pick up on its animated content
                     $window.setTimeout( fixContainerSize, RESIZE_DELAY );
                  } );
               }
            }

            //////////////////////////////////////////////////////////////////////////////////////////////////

            function stopWatchingForContentResizing() {
               if( clearWatcher ) {
                  clearWatcher();
                  clearWatcher = null;
               }
            }

            //////////////////////////////////////////////////////////////////////////////////////////////////

            function animateToHeight( jqElement, newHeight ) {
               currentTargetHeight = newHeight;
               startWatchingForContentResizing();
               if( newHeight > 0 ) {
                  jqElement.css( 'display', 'block' );
                  jqElement.animate( { 'height': `${newHeight}px` }, () => {
                     jqElement.css( 'height', 'auto' );
                     stopWatchingForContentResizing();
                  } );
               }
               else {
                  jqElement.animate( { 'height': 0 }, () => {
                     if( !showContent ) {
                        jqElement.css( 'display', 'none' );
                     }
                  } );
               }
            }
         }
      };
   } ];
}

//////////////////////////////////////////////////////////////////////////////////////////////////////////////

function calculateContentHeight( jqElement ) {
   jqElement.css( 'visibility', 'hidden' );
   jqElement.css( 'overflow', 'visible' );
   jqElement.css( 'height', 'auto' );
   const height = jqElement.outerHeight( true );
   jqElement.css( 'height', '0px' );
   jqElement.css( 'overflow', '' );
   jqElement.css( 'visibility', '' );

   return height;
}
