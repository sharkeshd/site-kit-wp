/**
 * Notifications API defaults
 *
 * Site Kit by Google, Copyright 2024 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import {
	SITE_KIT_VIEW_ONLY_CONTEXTS,
	VIEW_CONTEXT_ENTITY_DASHBOARD,
	VIEW_CONTEXT_ENTITY_DASHBOARD_VIEW_ONLY,
	VIEW_CONTEXT_MAIN_DASHBOARD,
	VIEW_CONTEXT_MAIN_DASHBOARD_VIEW_ONLY,
	VIEW_CONTEXT_SETTINGS,
} from '../constants';
import { NOTIFICATION_AREAS } from './datastore/constants';
import { CORE_SITE } from '../datastore/site/constants';
import { CORE_USER } from '../datastore/user/constants';
import { CORE_MODULES } from '../modules/datastore/constants';
import { MODULES_ANALYTICS_4 } from '../../modules/analytics-4/datastore/constants';
import { MODULES_SEARCH_CONSOLE } from '../../modules/search-console/datastore/constants';
import { READ_SCOPE as TAGMANAGER_READ_SCOPE } from '../../modules/tagmanager/datastore/constants';
import UnsatisfiedScopesAlert from '../../components/notifications/UnsatisfiedScopesAlert';
import UnsatisfiedScopesAlertGTE from '../../components/notifications/UnsatisfiedScopesAlertGTE';
import GatheringDataNotification from '../../components/notifications/GatheringDataNotification';
import ZeroDataNotification from '../../components/notifications/ZeroDataNotification';

/**
 * Registers notifications not specific to any one particular module.
 *
 * @since 1.132.0
 *
 * @param {Object} notificationsAPI Notifications API.
 */
export function registerDefaults( notificationsAPI ) {
	notificationsAPI.registerNotification( 'authentication-error', {
		Component: UnsatisfiedScopesAlert,
		priority: 150,
		areaSlug: NOTIFICATION_AREAS.ERRORS,
		viewContexts: [
			VIEW_CONTEXT_MAIN_DASHBOARD,
			VIEW_CONTEXT_MAIN_DASHBOARD_VIEW_ONLY,
			VIEW_CONTEXT_ENTITY_DASHBOARD,
			VIEW_CONTEXT_ENTITY_DASHBOARD_VIEW_ONLY,
			VIEW_CONTEXT_SETTINGS,
		],
		checkRequirements: ( { select } ) => {
			const setupErrorMessage =
				select( CORE_SITE ).getSetupErrorMessage();

			const isAuthenticated = select( CORE_USER ).isAuthenticated();

			const ga4ModuleConnected =
				select( CORE_MODULES ).isModuleConnected( 'analytics-4' );

			const hasTagManagerReadScope = select( CORE_USER ).hasScope(
				TAGMANAGER_READ_SCOPE
			);

			const showUnsatisfiedScopesAlertGTE =
				ga4ModuleConnected && ! hasTagManagerReadScope;

			const unsatisfiedScopes =
				select( CORE_USER ).getUnsatisfiedScopes();

			return (
				unsatisfiedScopes?.length &&
				! setupErrorMessage &&
				isAuthenticated &&
				! showUnsatisfiedScopesAlertGTE
			);
		},
		isDismissible: false,
	} );

	notificationsAPI.registerNotification( 'authentication-error-gte', {
		Component: UnsatisfiedScopesAlertGTE,
		priority: 150,
		areaSlug: NOTIFICATION_AREAS.ERRORS,
		viewContexts: [
			VIEW_CONTEXT_MAIN_DASHBOARD,
			VIEW_CONTEXT_MAIN_DASHBOARD_VIEW_ONLY,
			VIEW_CONTEXT_ENTITY_DASHBOARD,
			VIEW_CONTEXT_ENTITY_DASHBOARD_VIEW_ONLY,
			VIEW_CONTEXT_SETTINGS,
		],
		checkRequirements: ( { select } ) => {
			const setupErrorMessage =
				select( CORE_SITE ).getSetupErrorMessage();

			const isAuthenticated = select( CORE_USER ).isAuthenticated();

			const ga4ModuleConnected =
				select( CORE_MODULES ).isModuleConnected( 'analytics-4' );

			const hasTagManagerReadScope = select( CORE_USER ).hasScope(
				TAGMANAGER_READ_SCOPE
			);

			const showUnsatisfiedScopesAlertGTE =
				ga4ModuleConnected && ! hasTagManagerReadScope;

			return (
				! setupErrorMessage &&
				isAuthenticated &&
				showUnsatisfiedScopesAlertGTE
			);
		},
		isDismissible: false,
	} );

	notificationsAPI.registerNotification( 'gathering-data-notification', {
		Component: GatheringDataNotification,
		priority: 300,
		areaSlug: NOTIFICATION_AREAS.BANNERS_ABOVE_NAV,
		viewContexts: [
			VIEW_CONTEXT_MAIN_DASHBOARD,
			VIEW_CONTEXT_MAIN_DASHBOARD_VIEW_ONLY,
			VIEW_CONTEXT_ENTITY_DASHBOARD,
			VIEW_CONTEXT_ENTITY_DASHBOARD_VIEW_ONLY,
		],
		checkRequirements: async ( { select, resolveSelect }, viewContext ) => {
			const viewOnly =
				SITE_KIT_VIEW_ONLY_CONTEXTS.includes( viewContext );

			const isAnalyticsConnected =
				select( CORE_MODULES ).isModuleConnected( 'analytics-4' );

			const canViewSharedAnalytics = ! viewOnly
				? true
				: select( CORE_USER ).canViewSharedModule( 'analytics-4' );

			const canViewSharedSearchConsole = ! viewOnly
				? true
				: select( CORE_USER ).canViewSharedModule( 'search-console' );

			const showRecoverableAnalytics = await ( async () => {
				if ( ! viewOnly ) {
					return false;
				}

				const recoverableModules = await resolveSelect(
					CORE_MODULES
				).getRecoverableModules();

				return Object.keys( recoverableModules ).includes(
					'analytics-4'
				);
			} )();
			const showRecoverableSearchConsole = await ( async () => {
				if ( ! viewOnly ) {
					return false;
				}

				const recoverableModules = await resolveSelect(
					CORE_MODULES
				).getRecoverableModules();

				return Object.keys( recoverableModules ).includes(
					'search-console'
				);
			} )();

			const analyticsGatheringData =
				isAnalyticsConnected &&
				canViewSharedAnalytics &&
				false === showRecoverableAnalytics
					? await resolveSelect(
							MODULES_ANALYTICS_4
					  ).isGatheringData()
					: false;
			const searchConsoleGatheringData =
				canViewSharedSearchConsole &&
				false === showRecoverableSearchConsole &&
				( await resolveSelect(
					MODULES_SEARCH_CONSOLE
				).isGatheringData() );

			return analyticsGatheringData || searchConsoleGatheringData;
		},
		isDismissible: true,
	} );

	notificationsAPI.registerNotification( 'zero-data-notification', {
		Component: ZeroDataNotification,
		priority: 310,
		areaSlug: NOTIFICATION_AREAS.BANNERS_ABOVE_NAV,
		viewContexts: [
			VIEW_CONTEXT_MAIN_DASHBOARD,
			VIEW_CONTEXT_MAIN_DASHBOARD_VIEW_ONLY,
			VIEW_CONTEXT_ENTITY_DASHBOARD,
			VIEW_CONTEXT_ENTITY_DASHBOARD_VIEW_ONLY,
		],
		checkRequirements: async ( { select, resolveSelect }, viewContext ) => {
			const viewOnly =
				SITE_KIT_VIEW_ONLY_CONTEXTS.includes( viewContext );

			const getModuleState = async ( moduleSlug, datastoreSlug ) => {
				// Check if the module connected and return early if not.
				const isConnected =
					select( CORE_MODULES ).isModuleConnected( moduleSlug );
				if ( ! isConnected ) {
					return 'disconnected';
				}

				// If we are in the view only mode, we need to ensure the user can view the module
				// and it is not in the recovering state. Return early if either of these is wrong.
				if ( viewOnly ) {
					const canView =
						select( CORE_USER ).canViewSharedModule( moduleSlug );
					if ( ! canView ) {
						return 'cant-view';
					}

					const modules = await resolveSelect(
						CORE_MODULES
					).getRecoverableModules();
					if ( !! modules[ moduleSlug ] ) {
						return 'recovering';
					}
				}

				// Next, we need to check gathering data state and return early
				// if the module is in the gathering state.
				const isGatheringData = await resolveSelect(
					datastoreSlug
				).isGatheringData();
				if ( isGatheringData ) {
					return 'gathering';
				}

				// Finally, we need to preload the sample report and check if it has zero data.
				await resolveSelect( datastoreSlug ).getReport(
					select( datastoreSlug ).getSampleReportArgs()
				);

				if ( select( datastoreSlug ).hasZeroData() ) {
					return 'zero-data';
				}

				return 'connected';
			};

			// Get Analytics-4 and Search Console states.
			const analyticsState = await getModuleState(
				'analytics-4',
				MODULES_ANALYTICS_4
			);

			const searchConsoleState = await getModuleState(
				'search-console',
				MODULES_SEARCH_CONSOLE
			);

			// If either of the modules is gathering data, we don't show the notification.
			if (
				analyticsState === 'gathering' ||
				searchConsoleState === 'gathering'
			) {
				return false;
			}

			// If either of the modules is in the zero data state, we need to show the notification.
			return (
				analyticsState === 'zero-data' ||
				searchConsoleState === 'zero-data'
			);
		},
		isDismissible: true,
	} );
}
