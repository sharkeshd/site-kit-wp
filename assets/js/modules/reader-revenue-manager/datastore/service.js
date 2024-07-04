/**
 * `modules/reader-revenue-manager` data store.
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
import { addQueryArgs } from '@wordpress/url';

/**
 * Internal dependencies
 */
import { createRegistrySelector } from 'googlesitekit-data';
import { CORE_USER } from '../../../googlesitekit/datastore/user/constants';

const selectors = {
	/**
	 * Returns a link to the Reader Revenue Manager platform.
	 *
	 * @since n.e.x.t
	 *
	 * @param {string} publicationID Publication ID.
	 * @return {string} Link to Reader Revenue Management platform.
	 */
	getServiceURL: createRegistrySelector(
		( select ) =>
			( state, { path, query } = {} ) => {
				let serviceURL = 'https://publishercenter.google.com';

				// Always add the utm_source.
				query = {
					...query,
					utm_source: 'sitekit',
				};

				if ( path ) {
					const sanitizedPath = `/${ path.replace( /^\//, '' ) }`;
					serviceURL = `${ serviceURL }${ sanitizedPath }`;
				}

				serviceURL = addQueryArgs( serviceURL, query );

				const accountChooserBaseURI =
					select( CORE_USER ).getAccountChooserURL( serviceURL );

				if ( accountChooserBaseURI === undefined ) {
					return undefined;
				}

				return accountChooserBaseURI;
			}
	),
};

const store = {
	selectors,
};

export default store;
