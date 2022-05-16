/**
 * DashboardSharingSettings component.
 *
 * Site Kit by Google, Copyright 2022 Google LLC
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
import { __ } from '@wordpress/i18n';

/**
 * Internal dependencies
 */
import Data from 'googlesitekit-data';
import Module from './Module';
// import { PERMISSION_MANAGE_MODULE_SHARING_OPTIONS } from '../../../googlesitekit/datastore/user/constants';
import { CORE_MODULES } from '../../../googlesitekit/modules/datastore/constants';
import { CORE_SITE } from '../../../googlesitekit/datastore/site/constants';
const { useSelect } = Data;

export default function DashboardSharingSettings() {
	const modules = useSelect( ( select ) =>
		select( CORE_MODULES ).getModules()
	);
	const hasMultipleAdmins = useSelect( ( select ) =>
		select( CORE_SITE ).hasMultipleAdmins()
	);

	if ( modules === undefined ) {
		return null;
	}

	const activeModules = Object.keys( modules )
		.map( ( slug ) => modules[ slug ] )
		.filter( ( { internal, active } ) => ! internal && active )
		.sort( ( a, b ) => a.order - b.order );

	return (
		<div className="googlesitekit-dashboard-sharing-settings">
			<header className="googlesitekit-dashboard-sharing-settings__header googlesitekit-dashboard-sharing-settings__row">
				<div className="googlesitekit-dashboard-sharing-settings__column--product">
					{ __( 'Product', 'google-site-kit' ) }
				</div>
				<div className="googlesitekit-dashboard-sharing-settings__column--view">
					{ __( 'Who can view', 'google-site-kit' ) }
				</div>

				{ ! hasMultipleAdmins && (
					<div className="googlesitekit-dashboard-sharing-settings__column--manage">
						{ __(
							'Who can manage view access',
							'google-site-kit'
						) }
					</div>
				) }
			</header>

			<div className="googlesitekit-dashboard-sharing-settings__main">
				{ activeModules.map( ( { slug, name } ) => (
					<Module
						key={ slug }
						moduleSlug={ slug }
						moduleName={ name }
					/>
				) ) }
			</div>
		</div>
	);
}
