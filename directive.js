/**
 * Copyright 2015-2017 aixigo AG
 * Released under the MIT license.
 * http://laxarjs.org/license
 */
import * as $ from 'jquery';
import { fn } from 'laxar';

export const name = 'axShowHideWidgetDirective';

const STATE = 'axShowHideWidgetDirectiveState';
const RESIZE_DELAY = 25;

//////////////////////////////////////////////////////////////////////////////////////////////////////////////

export function create() {
   return [ '$window', 'axVisibilityService', ( $window, visibilityService ) => {
      return {
         restrict: 'A',
         link( scope, element, attrs ) {

            const options = scope.$eval( attrs[ name ] );

            let show;
            let hide;
            if( options.animationsEnabled ) {
               show = () => {
                  element.css( 'display', 'block' );
                  const height = calculateContentHeight( element );
                  animateToHeight( element, height );
               };
               hide = () => {
                  animateToHeight( element, 0 );
               };
            }
            else {
               show = () => { element.show(); };
               hide = () => { element.hide(); };
            }

            const fixContainerSize = fn.debounce( fixContainerSizeNow, RESIZE_DELAY );

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
                     element.show();
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
               element.children().each( ( index, child ) => {
                  contentHeight += $( child ).outerHeight( true );
               } );
               if( contentHeight !== currentTargetHeight ) {
                  animateToHeight( element, contentHeight );
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

            function animateToHeight( element, newHeight ) {
               currentTargetHeight = newHeight;
               startWatchingForContentResizing();
               if( newHeight > 0 ) {
                  element.css( 'display', 'block' );
                  element.animate( { 'height': `${newHeight}px` }, () => {
                     element.css( 'height', 'auto' );
                     stopWatchingForContentResizing();
                  } );
               }
               else {
                  element.animate( { 'height': 0 }, () => {
                     if( !showContent ) {
                        element.css( 'display', 'none' );
                     }
                  } );
               }
            }
         }
      };
   } ];
}

//////////////////////////////////////////////////////////////////////////////////////////////////////////////

function calculateContentHeight( element ) {
   element.css( 'visibility', 'hidden' );
   element.css( 'overflow', 'visible' );
   element.css( 'height', 'auto' );
   const height = $( element ).outerHeight( true );
   element.css( 'height', '0px' );
   element.css( 'overflow', '' );
   element.css( 'visibility', '' );

   return height;
}
