/**
 * AnalyticsAndAdSenseAccountsDetectedAsLinkedOverlayNotification component tests.
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
 * Internal dependencies
 */
import AnalyticsAndAdSenseAccountsDetectedAsLinkedOverlayNotification, {
	ANALYTICS_ADSENSE_LINKED_OVERLAY_NOTIFICATION,
} from './AnalyticsAndAdSenseAccountsDetectedAsLinkedOverlayNotification';
import {
	render,
	createTestRegistry,
	provideModules,
	fireEvent,
	act,
} from '../../../../tests/js/test-utils';
import { CORE_USER } from '../../googlesitekit/datastore/user/constants';
import { MODULES_ANALYTICS_4 } from '../../modules/analytics-4/datastore/constants';
import { CORE_UI } from '../../googlesitekit/datastore/ui/constants';
import { VIEW_CONTEXT_MAIN_DASHBOARD_VIEW_ONLY } from '../../googlesitekit/constants';

describe( 'AnalyticsAndAdSenseAccountsDetectedAsLinkedOverlayNotification', () => {
	let registry;

	const fetchGetDismissedItems = new RegExp(
		'^/google-site-kit/v1/core/user/data/dismissed-items'
	);
	const fetchDismissItem = new RegExp(
		'^/google-site-kit/v1/core/user/data/dismiss-item'
	);

	beforeEach( () => {
		registry = createTestRegistry();
		provideModules( registry, [
			{
				slug: 'adsense',
				active: true,
				connected: true,
			},
			{
				slug: 'analytics-4',
				active: true,
				connected: true,
			},
		] );
		registry.dispatch( CORE_USER ).receiveGetDismissedItems( [] );
		registry.dispatch( MODULES_ANALYTICS_4 ).setSettings( {
			adSenseLinked: true,
		} );
	} );

	it( 'does not render when Analytics module is not connected', () => {
		provideModules( registry, [
			{
				slug: 'adsense',
				active: true,
				connected: true,
			},
			{
				slug: 'analytics-4',
				active: true,
				connected: false,
			},
		] );

		const { container } = render(
			<AnalyticsAndAdSenseAccountsDetectedAsLinkedOverlayNotification />,
			{
				registry,
				features: [ 'ga4AdSenseIntegration' ],
			}
		);
		expect( container ).not.toHaveTextContent(
			'Data is now available for the pages that earn the most AdSense revenue'
		);
	} );

	it( 'does not render when AdSense module is not connected', () => {
		provideModules( registry, [
			{
				slug: 'adsense',
				active: true,
				connected: false,
			},
			{
				slug: 'analytics-4',
				active: true,
				connected: true,
			},
		] );

		const { container } = render(
			<AnalyticsAndAdSenseAccountsDetectedAsLinkedOverlayNotification />,
			{
				registry,
				features: [ 'ga4AdSenseIntegration' ],
			}
		);
		expect( container ).not.toHaveTextContent(
			'Data is now available for the pages that earn the most AdSense revenue'
		);
	} );

	it( 'does not render when isAdSenseLinked is `false`', () => {
		registry.dispatch( MODULES_ANALYTICS_4 ).setAdSenseLinked( false );

		const { container } = render(
			<AnalyticsAndAdSenseAccountsDetectedAsLinkedOverlayNotification />,
			{
				registry,
				features: [ 'ga4AdSenseIntegration' ],
			}
		);
		expect( container ).not.toHaveTextContent(
			'Data is now available for the pages that earn the most AdSense revenue'
		);
	} );

	it( 'does not render if dismissed previously', () => {
		registry
			.dispatch( CORE_USER )
			.receiveGetDismissedItems( [
				ANALYTICS_ADSENSE_LINKED_OVERLAY_NOTIFICATION,
			] );

		const { container } = render(
			<AnalyticsAndAdSenseAccountsDetectedAsLinkedOverlayNotification />,
			{
				registry,
				features: [ 'ga4AdSenseIntegration' ],
			}
		);
		expect( container ).not.toHaveTextContent(
			'Data is now available for the pages that earn the most AdSense revenue'
		);
	} );

	it( 'does not render if it was dismissed by the `dismissItem` action', async () => {
		fetchMock.getOnce( fetchGetDismissedItems, { body: [] } );
		fetchMock.postOnce( fetchDismissItem, {
			body: [ ANALYTICS_ADSENSE_LINKED_OVERLAY_NOTIFICATION ],
		} );

		// Dismissing the notification should cause it to not render.
		await registry
			.dispatch( CORE_UI )
			.dismissOverlayNotification(
				ANALYTICS_ADSENSE_LINKED_OVERLAY_NOTIFICATION
			);

		const { container } = render(
			<AnalyticsAndAdSenseAccountsDetectedAsLinkedOverlayNotification />,
			{
				registry,
				features: [ 'ga4AdSenseIntegration' ],
			}
		);
		expect( container ).not.toHaveTextContent(
			'Data is now available for the pages that earn the most AdSense revenue'
		);
	} );

	it( 'does not render if another notification is showing', async () => {
		await registry
			.dispatch( CORE_UI )
			.setOverlayNotificationToShow( 'TestOverlayNotification' );

		const { container } = render(
			<AnalyticsAndAdSenseAccountsDetectedAsLinkedOverlayNotification />,
			{
				registry,
				features: [ 'ga4AdSenseIntegration' ],
			}
		);
		expect( container ).not.toHaveTextContent(
			'Data is now available for the pages that earn the most AdSense revenue'
		);
	} );

	it( 'does not render without the feature flag', () => {
		registry
			.dispatch( CORE_USER )
			.receiveGetDismissedItems( [
				ANALYTICS_ADSENSE_LINKED_OVERLAY_NOTIFICATION,
			] );

		const { container } = render(
			<AnalyticsAndAdSenseAccountsDetectedAsLinkedOverlayNotification />,
			{
				registry,
			}
		);
		expect( container ).not.toHaveTextContent(
			'Data is now available for the pages that earn the most AdSense revenue'
		);
	} );

	it( 'renders if adSenseLinked is not set', () => {
		const { container } = render(
			<AnalyticsAndAdSenseAccountsDetectedAsLinkedOverlayNotification />,
			{
				registry,
				features: [ 'ga4AdSenseIntegration' ],
			}
		);

		expect( container ).toHaveTextContent(
			'Data is now available for the pages that earn the most AdSense revenue'
		);
	} );

	it( 'renders in "view only" dashboard', () => {
		const { container } = render(
			<AnalyticsAndAdSenseAccountsDetectedAsLinkedOverlayNotification />,
			{
				registry,
				features: [ 'ga4AdSenseIntegration' ],
				viewContext: VIEW_CONTEXT_MAIN_DASHBOARD_VIEW_ONLY,
			}
		);
		expect( container ).toHaveTextContent(
			'Data is now available for the pages that earn the most AdSense revenue'
		);
	} );

	it( 'renders `Show me` and `Maybe later` buttons`', () => {
		const { container } = render(
			<AnalyticsAndAdSenseAccountsDetectedAsLinkedOverlayNotification />,
			{
				registry,
				features: [ 'ga4AdSenseIntegration' ],
			}
		);

		expect( container ).toHaveTextContent( 'Show me' );
		expect( container ).toHaveTextContent( 'Maybe later' );
	} );

	it( 'clicking the `Show me` button dismisses the notification', async () => {
		fetchMock.getOnce( fetchGetDismissedItems, { body: [] } );
		fetchMock.postOnce( fetchDismissItem, {
			body: [ ANALYTICS_ADSENSE_LINKED_OVERLAY_NOTIFICATION ],
		} );

		const { container, getByRole, rerender, waitForRegistry } = render(
			<AnalyticsAndAdSenseAccountsDetectedAsLinkedOverlayNotification />,
			{
				registry,
				features: [ 'ga4AdSenseIntegration' ],
			}
		);

		await waitForRegistry();

		expect( container ).toHaveTextContent(
			'Data is now available for the pages that earn the most AdSense revenue'
		);

		act( () => {
			fireEvent.click( getByRole( 'button', { name: /Show me/i } ) );
		} );

		rerender();

		expect( container ).not.toHaveTextContent(
			'Data is now available for the pages that earn the most AdSense revenue'
		);
	} );

	it( 'clicking the `Maybe later` button dismisses the notification', async () => {
		fetchMock.getOnce( fetchGetDismissedItems, { body: [] } );
		fetchMock.postOnce( fetchDismissItem, {
			body: [ ANALYTICS_ADSENSE_LINKED_OVERLAY_NOTIFICATION ],
		} );

		const { container, getByRole, rerender, waitForRegistry } = render(
			<AnalyticsAndAdSenseAccountsDetectedAsLinkedOverlayNotification />,
			{
				registry,
				features: [ 'ga4AdSenseIntegration' ],
			}
		);

		await waitForRegistry();

		expect( container ).toHaveTextContent(
			'Data is now available for the pages that earn the most AdSense revenue'
		);

		act( () => {
			fireEvent.click( getByRole( 'button', { name: /maybe later/i } ) );
		} );

		rerender();

		expect( container ).not.toHaveTextContent(
			'Data is now available for the pages that earn the most AdSense revenue'
		);
	} );
} );
