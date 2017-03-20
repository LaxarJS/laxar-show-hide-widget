/**
 * Copyright 2015-2017 aixigo AG
 * Released under the MIT license.
 * http://laxarjs.org/license
 */
import * as axMocks from 'laxar-mocks';
import 'angular';
import 'angular-mocks';

let widgetEventBus;
let widgetScope;
let testEventBus;
const anyObject = jasmine.any( Object );

function createSetup( widgetConfiguration ) {

   beforeEach( axMocks.setupForWidget() );

   beforeEach( () => {
      axMocks.widget.configure( widgetConfiguration );
   } );

   beforeEach( axMocks.widget.load );

   beforeEach( () => {
      widgetScope = axMocks.widget.$scope;
      widgetEventBus = axMocks.widget.axEventBus;
      testEventBus = axMocks.eventBus;
      axMocks.triggerStartupEvents();
   } );
}

afterEach( axMocks.tearDown );

//////////////////////////////////////////////////////////////////////////////////////////////////////////////

describe( 'An ax-show-hide-widget', () => {

   describe( 'with a configured feature area and a name for it', () => {

      createSetup( {
         area: {
            name: 'toggleMe'
         }
      } );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      it( 'exports a widget area whose visibility is toggled (R1.1)', () => {
         expect( widgetScope.model.contentArea ).toEqual( 'toggleMe' );
      } );

   } );

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   describe( 'with a configured feature area without name', () => {

      createSetup( {
         area: {}
      } );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      it( 'names the widget area "content" (R1.2)', () => {
         expect( widgetScope.model.contentArea ).toEqual( 'content' );
      } );

   } );

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   describe( 'with a configured feature show', () => {

      createSetup( {
         show: {
            onActions: [ 'showAreaRequest' ]
         },
         visibility: {
            flag: 'visibleArea'
         }
      } );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      it( 'intially hides the area', () => {
         expect( widgetScope.model.areaShowing ).toBe( false );
      } );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      describe( 'when the configured action is published', () => {

         beforeEach( done => {
            testEventBus.publish( 'takeActionRequest.showAreaRequest', {
               action: 'showAreaRequest'
            } );
            testEventBus.drainAsync().then( done, done.fail );
         } );

         /////////////////////////////////////////////////////////////////////////////////////////////////////

         it( 'shows the area (R2.1)', () => {
            expect( widgetScope.model.areaShowing ).toBe( true );
         } );

         /////////////////////////////////////////////////////////////////////////////////////////////////////

         it( 'sends willTakeAction and didTakeAction events (R2.1)', () => {
            expect( widgetEventBus.publish ).toHaveBeenCalledWith(
               'willTakeAction.showAreaRequest', { action: 'showAreaRequest' }, anyObject
            );
            expect( widgetEventBus.publish ).toHaveBeenCalledWith(
               'didTakeAction.showAreaRequest.SUCCESS', {
                  action: 'showAreaRequest',
                  outcome: 'SUCCESS'
               }, anyObject
            );
         } );

         /////////////////////////////////////////////////////////////////////////////////////////////////////

         it( 'publishes the new visibility of the content via flag (R4.1)', () => {
            expect( widgetEventBus.publish )
               .toHaveBeenCalledWith( 'didChangeFlag.visibleArea.true', {
                  flag: 'visibleArea',
                  state: true
               } );
         } );

      } );

   } );

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   describe( 'with a configured feature hide', () => {

      createSetup( {
         hide: {
            onActions: [ 'hideAreaRequest' ]
         },
         visibility: {
            flag: 'visibleArea'
         }
      } );

      beforeEach( () => {
         widgetScope.model.areaShowing = true;
      } );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      describe( 'when the configured action is published', () => {

         beforeEach( done => {
            testEventBus.publish( 'takeActionRequest.hideAreaRequest', {
               action: 'hideAreaRequest'
            } );
            testEventBus.drainAsync().then( done, done.fail );
         } );

         /////////////////////////////////////////////////////////////////////////////////////////////////////

         it( 'hides the area for a configured action (R3.1)', () => {
            expect( widgetScope.model.areaShowing ).toBe( false );
         } );

         /////////////////////////////////////////////////////////////////////////////////////////////////////

         it( 'sends willTakeAction and didTakeAction events when the action takes place (R3.1)', () => {
            expect( widgetEventBus.publish ).toHaveBeenCalledWith(
               'willTakeAction.hideAreaRequest', { action: 'hideAreaRequest' }, anyObject
            );
            expect( widgetEventBus.publish ).toHaveBeenCalledWith(
               'didTakeAction.hideAreaRequest.SUCCESS', {
                  action: 'hideAreaRequest',
                  outcome: 'SUCCESS'
               }, anyObject
            );
         } );

         /////////////////////////////////////////////////////////////////////////////////////////////////////

         it( 'publishes the new visibility of the content via flag (R4.1)', () => {
            expect( widgetEventBus.publish )
               .toHaveBeenCalledWith( 'didChangeFlag.visibleArea.false', {
                  flag: 'visibleArea',
                  state: false
               } );
         } );
      } );

   } );

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   describe( 'with a configured feature visibility', () => {

      createSetup( {
         visibility: {
            flag: 'visibleArea',
            toggleOn: [ 'mustShowContent' ]
         }
      } );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      it( 'initially publishes the flag state on didNavigate (R4.2)', () => {
         expect( widgetEventBus.publish )
            .toHaveBeenCalledWith( 'didChangeFlag.visibleArea.false', {
               flag: 'visibleArea',
               state: false
            } );
      } );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      describe( 'when the toggleOn flag is published while hidden', () => {

         beforeEach( done => {
            testEventBus.publish( 'didChangeFlag.mustShowContent.true', {
               flag: 'mustShowContent',
               state: true
            } );
            testEventBus.drainAsync().then( done, done.fail );
         } );

         /////////////////////////////////////////////////////////////////////////////////////////////////////

         it( 'the content is shown (R4.3)', () => {
            expect( widgetScope.model.areaShowing ).toBe( true );
         } );

         /////////////////////////////////////////////////////////////////////////////////////////////////////

         it( 'publishes the new visibility of the provided area (R4.5)', () => {
            expect( axMocks.widget.axVisibility.updateAreaVisibility ).toHaveBeenCalledWith( {
               content: true
            } );
         } );

         /////////////////////////////////////////////////////////////////////////////////////////////////////

         describe( 'and the flag is toggled again', () => {

            beforeEach( done => {
               testEventBus.publish( 'didChangeFlag.mustShowContent.false', {
                  flag: 'mustShowContent',
                  state: false
               } );
               testEventBus.drainAsync().then( done, done.fail );
            } );

            //////////////////////////////////////////////////////////////////////////////////////////////////

            it( 'the content is hidden (R4.3)', () => {
               expect( widgetScope.model.areaShowing ).toBe( false );
            } );

            //////////////////////////////////////////////////////////////////////////////////////////////////

            it( 'publishes the new visibility of the provided area (R4.5)', () => {
               expect( axMocks.widget.axVisibility.updateAreaVisibility ).toHaveBeenCalledWith( {
                  content: false
               } );
            } );

         } );

      } );

   } );

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   describe( 'with a configured feature visibility with a configured inverted flag', () => {

      createSetup( {
         visibility: {
            toggleOn: [ '!mustHideContent' ]
         }
      } );
      beforeEach( done => {
         testEventBus.publish( 'didChangeFlag.mustHideContent.false', {
            flag: 'mustHideContent',
            state: false
         } );
         testEventBus.drainAsync().then( done, done.fail );
      } );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      it( 'can be toggled via inverted flag (R4.3)', () => {
         expect( widgetScope.model.areaShowing ).toBe( true );
      } );

   } );

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   describe( 'with visibility initially set to true', () => {

      createSetup( {
         visibility: {
            initially: true
         }
      } );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      it( 'starts in the visible state (R4.4)', () => {
         expect( widgetScope.model.areaShowing ).toBe( true );
      } );

   } );

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   describe( 'when both actions and visibility.toggleOn flag are configured', () => {

      createSetup( {
         show: {
            onActions: [ 'showAreaRequest' ]
         },
         visibility: {
            toggleOn: [ 'mustShowContent' ]
         }
      } );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      it( 'logs a warning', () => {
         expect( axMocks.widget.axLog.warn ).toHaveBeenCalledWith(
            'Both actions and visibility.toggleOn flags were configured. ' +
            'This may lead to inconsistent visibility state information and flag changes being ignored.'
         );
      } );

   } );

} );
