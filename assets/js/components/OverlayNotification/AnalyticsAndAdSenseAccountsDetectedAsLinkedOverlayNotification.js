/**
 * AnalyticsAndAdSenseAccountsDetectedAsLinkedOverlayNotification component.
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

/**
 * WordPress dependencies
 */
import { useCallback, useEffect } from '@wordpress/element';
import { __ } from '@wordpress/i18n';

/**
 * Internal dependencies
 */
import { Button } from 'googlesitekit-components';
import Data from 'googlesitekit-data';
import AnalyticsAdsenseLinkedGraphic from '../../../svg/graphics/analytics-adsense-linked.svg';
import { ANCHOR_ID_MONETIZATION } from '../../googlesitekit/constants';
import { CORE_UI } from '../../googlesitekit/datastore/ui/constants';
import { CORE_USER } from '../../googlesitekit/datastore/user/constants';
import { CORE_MODULES } from '../../googlesitekit/modules/datastore/constants';
import { useBreakpoint } from '../../hooks/useBreakpoint';
import { useFeature } from '../../hooks/useFeature';
import { MODULES_ANALYTICS_4 } from '../../modules/analytics-4/datastore/constants';
import { getContextScrollTop } from '../../util/scroll';
import OverlayNotification from './OverlayNotification';

const { useSelect, useDispatch } = Data;

export const ANALYTICS_ADSENSE_LINKED_OVERLAY_NOTIFICATION =
	'AnalyticsAndAdSenseLinkedOverlayNotification';

export default function AnalyticsAndAdSenseAccountsDetectedAsLinkedOverlayNotification() {
	const ga4AdSenseIntegration = useFeature( 'ga4AdSenseIntegration' );
	const breakpoint = useBreakpoint();

	const isShowingNotification = useSelect( ( select ) =>
		select( CORE_UI ).isShowingOverlayNotification(
			ANALYTICS_ADSENSE_LINKED_OVERLAY_NOTIFICATION
		)
	);

	const { setOverlayNotificationToShow, dismissOverlayNotification } =
		useDispatch( CORE_UI );

	const isDismissed = useSelect( ( select ) =>
		select( CORE_USER ).isItemDismissed(
			ANALYTICS_ADSENSE_LINKED_OVERLAY_NOTIFICATION
		)
	);

	const isDismissing = useSelect( ( select ) =>
		select( CORE_USER ).isDismissingItem(
			ANALYTICS_ADSENSE_LINKED_OVERLAY_NOTIFICATION
		)
	);

	const analyticsModuleConnected = useSelect( ( select ) =>
		select( CORE_MODULES ).isModuleConnected( 'analytics-4' )
	);

	const adSenseModuleConnected = useSelect( ( select ) =>
		select( CORE_MODULES ).isModuleConnected( 'adsense' )
	);

	const isAdSenseLinked = useSelect( ( select ) => {
		return select( MODULES_ANALYTICS_4 ).getAdSenseLinked();
	} );

	const analyticsAndAdSenseAreConnected =
		analyticsModuleConnected && adSenseModuleConnected;

	const shouldShowNotification =
		ga4AdSenseIntegration &&
		analyticsAndAdSenseAreConnected &&
		isAdSenseLinked === true &&
		isDismissed === false;

	const dismissNotification = useCallback( () => {
		// Dismiss the notification, which also dismisses it from
		// the current users profile with the `dismissItem` action.
		dismissOverlayNotification(
			ANALYTICS_ADSENSE_LINKED_OVERLAY_NOTIFICATION
		);
	}, [ dismissOverlayNotification ] );

	const scrollToWidget = ( event ) => {
		event.preventDefault();

		const widgetClass = '.googlesitekit-widget--adsenseTopEarningPagesGA4';

		global.history.replaceState( {}, '', `#${ ANCHOR_ID_MONETIZATION }` );
		global.scrollTo( {
			top: getContextScrollTop( widgetClass, breakpoint ),
			behavior: 'smooth',
		} );
	};

	useEffect( () => {
		if ( shouldShowNotification && ! isShowingNotification ) {
			// It is safe to trigger current overlay notification with check for
			// `isShowingCurrentOverlayNotification`, without checking if any overlay
			// notification is showing instead, because `setOverlayNotificationToShow`
			// action will not show it if another overlay notification is already showing.
			setOverlayNotificationToShow(
				ANALYTICS_ADSENSE_LINKED_OVERLAY_NOTIFICATION
			);
		}
	}, [
		shouldShowNotification,
		isShowingNotification,
		setOverlayNotificationToShow,
	] );

	if ( ! shouldShowNotification || ! isShowingNotification ) {
		return null;
	}

	return (
		<OverlayNotification animateNotification={ isShowingNotification }>
			<AnalyticsAdsenseLinkedGraphic />

			<div className="googlesitekit-overlay-notification__body">
				<h3>
					{ __( 'See your top earning content', 'google-site-kit' ) }
				</h3>
				<p>
					{ __(
						'Data is now available for the pages that earn the most AdSense revenue.',
						'google-site-kit'
					) }
				</p>
			</div>

			<div className="googlesitekit-overlay-notification__actions">
				<Button
					tertiary
					disabled={ isDismissing }
					onClick={ dismissNotification }
				>
					{ __( 'Maybe later', 'google-site-kit' ) }
				</Button>

				<Button disabled={ isDismissing } onClick={ scrollToWidget }>
					{ __( 'Show me', 'google-site-kit' ) }
				</Button>
			</div>
		</OverlayNotification>
	);
}
