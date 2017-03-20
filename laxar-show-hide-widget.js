/**
 * Copyright 2015-2017 aixigo AG
 * Released under the MIT license.
 * http://laxarjs.org/license
 */
import * as ng from 'angular';
import { object } from 'laxar';
import { actions, flags } from 'laxar-patterns';
import * as directive from './directive';

//////////////////////////////////////////////////////////////////////////////////////////////////////////////

Controller.$inject = [ '$scope', 'axLog', 'axVisibility' ];

function Controller( $scope, log, visibility ) {

   $scope.model = {
      contentArea: $scope.features.area.name,
      areaShowing: $scope.features.visibility.initially,
      options: {
         animationsEnabled: $scope.features.animation.enabled
      }
   };
   let visibilityIsChanging = false;

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   publishAreaVisibility();

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   if( configuredBothActionsAndFlags() ) {
      log.warn(
         'Both actions and visibility.toggleOn flags were configured. ' +
         'This may lead to inconsistent visibility state information and flag changes being ignored.'
      );
   }

   actions.handlerFor( $scope )
      .registerActionsFromFeature( 'show', () => { applyNewVisibility( true ); } )
      .registerActionsFromFeature( 'hide', () => { applyNewVisibility( false ); } );

   flags.handlerFor( $scope )
      .registerFlagFromFeature( 'visibility.toggleOn', {
         initialState: $scope.features.visibility.initially,
         contextKey: 'flags.toggleOnState',
         optional: true,
         onChange: applyNewVisibility
      } );
   const publishVisibilityFlag = flags.publisherForFeature( $scope, 'visibility.flag', { optional: true } );

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   $scope.eventBus.subscribe( 'didNavigate', () => {
      publishVisibilityFlag( $scope.model.areaShowing );
   } );

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   function applyNewVisibility( newVisibility ) {
      if( $scope.model.areaShowing === newVisibility ) {
         return Promise.resolve();
      }

      visibilityIsChanging = true;
      return publishVisibilityFlag( newVisibility )
         .then( publishAreaVisibility )
         .then( () => {
            $scope.model.areaShowing = newVisibility;
            visibilityIsChanging = false;
         } );
   }

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   function publishAreaVisibility() {
      const showing = visibilityIsChanging ? !$scope.model.areaShowing : $scope.model.areaShowing;
      return visibility.updateAreaVisibility( { [ $scope.features.area.name ]: showing } );
   }

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   function configuredBothActionsAndFlags() {
      const configuredActions = [
         ...object.path( $scope.features, 'show.onActions', [] ),
         ...object.path( $scope.features, 'hide.onActions', [] )
      ];
      const configuredFlags = object.path( $scope.features, 'visibility.toggleOn', [] );
      return configuredActions.length && configuredFlags.length;
   }

}

//////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const name = ng.module( 'axShowHideWidget', [] )
   .controller( 'AxShowHideWidgetController', Controller )
   .directive( directive.name, directive.create() ).name;
