/**
 * Analytics Settings controls.
 *
 * Site Kit by Google, Copyright 2021 Google LLC
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
import { createInterpolateElement } from '@wordpress/element';
import { __, sprintf } from '@wordpress/i18n';

/**
 * Internal dependencies
 */
import Data from 'googlesitekit-data';
import { MODULES_ANALYTICS, PROFILE_CREATE } from '../../datastore/constants';
import { CORE_MODULES } from '../../../../googlesitekit/modules/datastore/constants';
import {
	AccountSelect,
	ProfileNameTextField,
	ProfileSelect,
	PropertySelect,
} from '../common';
import SettingsUseSnippetSwitch from './SettingsUseSnippetSwitch';
import SettingsNotice from '../../../../components/SettingsNotice/SettingsNotice';
import { TYPE_INFO } from '../../../../components/SettingsNotice';
import WarningIcon from '../../../../../../assets/svg/icons/warning-icon.svg';
const { useSelect } = Data;

export default function SettingsControls( { hasModuleAccess } ) {
	const profileID = useSelect( ( select ) =>
		select( MODULES_ANALYTICS ).getProfileID()
	);

	const module = useSelect( ( select ) =>
		select( CORE_MODULES ).getModule( 'analytics' )
	);

	const formattedOwnerName = module?.owner?.login
		? `<strong>${ module.owner.login }</strong>`
		: __( 'Another admin', 'google-site-kit' );

	return (
		<div className="googlesitekit-settings-module__fields-group">
			<div className="googlesitekit-setup-module__inputs">
				<AccountSelect hasModuleAccess={ hasModuleAccess } />
				<PropertySelect hasModuleAccess={ hasModuleAccess } />
				<ProfileSelect hasModuleAccess={ hasModuleAccess } />
			</div>

			{ hasModuleAccess === false && (
				<SettingsNotice
					type={ TYPE_INFO }
					Icon={ WarningIcon }
					notice={ createInterpolateElement(
						sprintf(
							/* translators: 1: module owner's name, 2: module name */
							__(
								'%1$s configured %2$s and you don’t have access to its configured property. Contact them to share access or change the configured property.',
								'google-site-kit'
							),
							formattedOwnerName,
							module?.name
						),
						{
							strong: <strong />,
						}
					) }
				/>
			) }

			{ profileID === PROFILE_CREATE && (
				<div className="googlesitekit-setup-module__inputs googlesitekit-setup-module__inputs--multiline">
					<ProfileNameTextField />
				</div>
			) }

			<div className="googlesitekit-settings-module__meta-item">
				<SettingsUseSnippetSwitch />
			</div>
		</div>
	);
}
