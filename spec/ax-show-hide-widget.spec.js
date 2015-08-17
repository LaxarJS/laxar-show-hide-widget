/**
 * Copyright 2015 aixigo AG
 * Released under the MIT license.
 * http://laxarjs.org/license
 */
define( [
   'json!../widget.json',
   '../ax-show-hide-widget',
   'laxar/laxar_testing'
], function( descriptor, module, ax ) {
   'use strict';

   describe( 'An ax-show-hide-widget', function() {

      var testBed;

      beforeEach( function setup() {
         testBed = ax.testing.portalMocksAngular.createControllerTestBed( descriptor );
         testBed.useWidgetJson();
         testBed.featuresMock = {
            area: {
               name: 'toggleMe'
            }
         };
         refresh( testBed );
      } );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      describe( 'with a configured feature area', function() {

         it( 'exports a widget area whose visibility is toggled (R1.1)', function() {
            expect( testBed.scope.model.contentArea ).toEqual( 'toggleMe' );
         } );

         /////////////////////////////////////////////////////////////////////////////////////////////////////

         it( 'names the widget area "content" if nothing else is configured (R1.2)', function() {
            delete testBed.featuresMock.area.name;
            refresh( testBed );
            expect( testBed.scope.model.contentArea ).toEqual( 'content' );
         } );

      } );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      describe( 'with a configured feature show', function() {

         beforeEach( function() {
            testBed.featuresMock.show = {
               onActions: [ 'showAreaRequest' ]
            };
            refresh( testBed );
         } );

         /////////////////////////////////////////////////////////////////////////////////////////////////////

         it( 'shows the area for a configured action (R2.1)', function() {
            expect( testBed.scope.model.areaShowing ).toBe( false );
            testBed.eventBusMock.publish( 'takeActionRequest.showAreaRequest', {
               action: 'showAreaRequest'
            } );
            jasmine.Clock.tick( 0 );
            expect( testBed.scope.model.areaShowing ).toBe( true );
         } );

         /////////////////////////////////////////////////////////////////////////////////////////////////////

         it( 'sends willTakeAction and didTakeAction events when the action takes place (R2.1)', function() {
            testBed.eventBusMock.publish( 'takeActionRequest.showAreaRequest', {
               action: 'showAreaRequest'
            } );
            jasmine.Clock.tick( 0 );
            expect( testBed.scope.eventBus.publish )
               .toHaveBeenCalledWith( 'willTakeAction.showAreaRequest', { action: 'showAreaRequest' } );
            expect( testBed.scope.eventBus.publish )
               .toHaveBeenCalledWith( 'didTakeAction.showAreaRequest', { action: 'showAreaRequest' } );
         } );
      } );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      describe( 'with a configured feature hide', function() {

         beforeEach( function() {
            testBed.featuresMock.hide = {
               onActions: [ 'hideAreaRequest' ]
            };
            refresh( testBed );
            testBed.scope.model.areaShowing = true;
         } );

         /////////////////////////////////////////////////////////////////////////////////////////////////////

         it( 'hides the area for a configured action (R3.1)', function() {
            expect( testBed.scope.model.areaShowing ).toBe( true );
            testBed.eventBusMock.publish( 'takeActionRequest.hideAreaRequest', {
               action: 'hideAreaRequest'
            } );
            jasmine.Clock.tick( 0 );
            expect( testBed.scope.model.areaShowing ).toBe( false );
         } );

         /////////////////////////////////////////////////////////////////////////////////////////////////////

         it( 'sends willTakeAction and didTakeAction events when the action takes place (R3.1)', function() {
            testBed.eventBusMock.publish( 'takeActionRequest.hideAreaRequest', {
               action: 'hideAreaRequest'
            } );
            jasmine.Clock.tick( 0 );
            expect( testBed.scope.eventBus.publish )
               .toHaveBeenCalledWith( 'willTakeAction.hideAreaRequest', { action: 'hideAreaRequest' } );
            expect( testBed.scope.eventBus.publish )
               .toHaveBeenCalledWith( 'didTakeAction.hideAreaRequest', { action: 'hideAreaRequest' } );
         } );

      } );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      describe( 'with a configured feature visibility', function() {

         beforeEach( function() {
            testBed.featuresMock = {
               show: {
                  onActions: [ 'showAreaRequest' ]
               },
               hide: {
                  onActions: [ 'hideAreaRequest' ]
               },
               visibility: {
                  flag: 'visibleArea',
                  toggleOn: 'mustShowContent'
               }
            };
            refresh( testBed );
         } );

         /////////////////////////////////////////////////////////////////////////////////////////////////////

         it( 'publishes the visibility (showing) of the content via flag (R4.1)', function() {
            testBed.scope.eventBus.publish.reset();
            testBed.eventBusMock.publish( 'takeActionRequest.showAreaRequest', {
               action: 'showAreaRequest'
            } );
            jasmine.Clock.tick( 0 );
            expect( testBed.scope.eventBus.publish )
               .toHaveBeenCalledWith( 'didChangeFlag.visibleArea.true', {
                  flag: 'visibleArea',
                  state: true
               } );
         } );

         /////////////////////////////////////////////////////////////////////////////////////////////////////

         it( 'publishes the visibility (hiding) of the content via flag (R4.1)', function() {
            testBed.scope.model.areaShowing = true;
            testBed.scope.eventBus.publish.reset();
            testBed.eventBusMock.publish( 'takeActionRequest.hideAreaRequest', {
               action: 'hideAreaRequest'
            } );
            jasmine.Clock.tick( 0 );
            expect( testBed.scope.eventBus.publish )
               .toHaveBeenCalledWith( 'didChangeFlag.visibleArea.false', {
                  flag: 'visibleArea',
                  state: false
               } );
         } );

         /////////////////////////////////////////////////////////////////////////////////////////////////////

         it( 'initially publishes the flag state on didNavigate (R4.2)', function() {
            expect( testBed.scope.eventBus.publish )
               .toHaveBeenCalledWith( 'didChangeFlag.visibleArea.false', {
                  flag: 'visibleArea',
                  state: false
               } );
         } );

         /////////////////////////////////////////////////////////////////////////////////////////////////////

         it( 'can be shown via flag (R4.3)', function() {
            expect( testBed.scope.model.areaShowing ).toBe( false );
            testBed.eventBusMock.publish( 'didChangeFlag.mustShowContent.true', {
               flag: 'mustShowContent',
               state: true
            } );
            jasmine.Clock.tick( 0 );
            expect( testBed.scope.model.areaShowing ).toBe( true );
         } );

         /////////////////////////////////////////////////////////////////////////////////////////////////////

         it( 'can be hidden via flag (R4.3)', function() {
            testBed.scope.model.areaShowing = true;
            testBed.eventBusMock.publish( 'didChangeFlag.mustShowContent.false', {
               flag: 'mustShowContent',
               state: false
            } );
            jasmine.Clock.tick( 0 );
            expect( testBed.scope.model.areaShowing ).toBe( false );
         } );

         /////////////////////////////////////////////////////////////////////////////////////////////////////

         it( 'can be toggled via inverted flag (R4.3)', function() {
            testBed.featuresMock.visibility.toggleOn = '!mustHideContent';
            refresh( testBed );
            testBed.eventBusMock.publish( 'didChangeFlag.mustHideContent.false', {
               flag: 'mustHideContent',
               state: false
            } );
            jasmine.Clock.tick( 0 );
            expect( testBed.scope.model.areaShowing ).toBe( true );
         } );


         /////////////////////////////////////////////////////////////////////////////////////////////////////

         it( 'processes change requests for the visibility of the provided areas (R4.4)', function() {
            expect( testBed.scope.eventBus.subscribe ).toHaveBeenCalledWith(
               'changeAreaVisibilityRequest.testWidgetId', jasmine.any( Function )
            );

            testBed.eventBusMock.publish( 'changeAreaVisibilityRequest.testWidgetId.content.true', {
               area: 'testWidgetId.content',
               visible: true
            } );
            jasmine.Clock.tick( 0 );
            expect( testBed.scope.eventBus.publish ).toHaveBeenCalledWith(
               'didChangeAreaVisibility.testWidgetId.content.false', {
                  area: 'testWidgetId.content',
                  visible: false
               }, jasmine.any( Object )
            );
         } );

         /////////////////////////////////////////////////////////////////////////////////////////////////////

         describe( 'when shown', function() {

            beforeEach( function() {
               testBed.eventBusMock.publish( 'didChangeAreaVisibility.testArea.true', {
                  area: 'testArea',
                  visible: true
               } );
               testBed.eventBusMock.publish( 'takeActionRequest.showAreaRequest', {
                  action: 'showAreaRequest'
               } );
               jasmine.Clock.tick( 0 );
            } );

            //////////////////////////////////////////////////////////////////////////////////////////////////

            it( 'triggers change requests for the visibility of the provided areas (R4.5)', function() {
               expect( testBed.scope.eventBus.publishAndGatherReplies ).toHaveBeenCalledWith(
                  'changeWidgetVisibilityRequest.testWidgetId.true', {
                     widget: 'testWidgetId',
                     visible: true
                  }, jasmine.any( Object )
               );

               testBed.eventBusMock.publish( 'changeAreaVisibilityRequest.testWidgetId.content.true', {
                  area: 'testWidgetId.content',
                  visible: true
               } );
               jasmine.Clock.tick( 0 );
               expect( testBed.scope.eventBus.publish ).toHaveBeenCalledWith(
                  'didChangeAreaVisibility.testWidgetId.content.true', {
                     area: 'testWidgetId.content',
                     visible: true
                  }, jasmine.any( Object )
               );
            } );

            //////////////////////////////////////////////////////////////////////////////////////////////////

            describe( 'and hidden again', function() {

               beforeEach( function() {
                  testBed.eventBusMock.publish( 'didChangeAreaVisibility.testArea.false', {
                     area: 'testArea',
                     visible: false
                  } );
                  testBed.eventBusMock.publish( 'changeAreaVisibilityRequest.testWidgetId.content.true', {
                     area: 'testWidgetId.content',
                     visible: true
                  } );
                  jasmine.Clock.tick( 0 );
               } );

               ///////////////////////////////////////////////////////////////////////////////////////////////

               it( 'triggers change requests for the visibility of the provided areas (R4.5)', function() {
                  expect( testBed.scope.eventBus.publish ).toHaveBeenCalledWith(
                     'didChangeAreaVisibility.testWidgetId.content.false', {
                        area: 'testWidgetId.content',
                        visible: false
                     }, jasmine.any( Object )
                  );
               } );
            } );
         } );
      } );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      describe( 'with visibility set initially to true', function() {

         beforeEach( function() {
            testBed.featuresMock = {
               show: {
                  onActions: [ 'showAreaRequest' ]
               },
               hide: {
                  onActions: [ 'hideAreaRequest' ]
               },
               visibility: {
                  flag: 'visibleArea',
                  toggleOn: 'mustShowContent',
                  initially: true
               }
            };
            refresh( testBed );
         } );

         /////////////////////////////////////////////////////////////////////////////////////////////////////

         it( 'starts in the visible state (R4.4)', function() {
            jasmine.Clock.tick( 0 );
            expect( testBed.scope.model.areaShowing ).toBe( true );
         } );
      } );
   } );

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   function refresh( testBed ) {
      testBed.setup();
      testBed.eventBusMock.publish( 'didNavigate' );
      jasmine.Clock.tick( 0 );
   }
} );
