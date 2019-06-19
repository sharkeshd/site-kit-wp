/**
 * Analytics utility functions.
 *
 * Site Kit by Google, Copyright 2019 Google LLC
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

import { changeToPercent } from 'GoogleUtil';

const { each }  = lodash;
const { __ } = wp.i18n;

export const extractAnalyticsDataForTrafficChart = ( reports ) => {
	if ( ! reports || ! reports.length ) {
		return null;
	}

	const data = reports[0].data;
	const rows = data.rows;

	let totalSessions = data.totals[0].values[0];
	let dataMap = [
		[ 'Source', 'Percent' ]
	];

	each( rows, ( row ) => {
		const sessions = row.metrics[0].values[0];
		const source = row.dimensions[0].replace( /\(none\)/gi, 'direct' );
		const percent = ( sessions / totalSessions );

		// Exclude sources below 1%.
		if ( 1 > ( percent * 100 ) ) {
			return false;
		}
		dataMap.push( [ source, percent ] );
	} );

	return dataMap;
};

/**
 * Reduce and process an array of analytics row data.
 *
 * @param {array} rows An array of rows to reduce.
 * @param {array} selectedStats The currently selected stat we need to return data for.
 */
function reduceAnalyticsRowsData( rows, selectedStats ) {
	const dataMap = [];
	each( rows, ( row ) => {
		if ( row.metrics ) {
			const { values } = row.metrics[0];
			const dateString = row.dimensions[0];
			const dateWithDashes =
				dateString.slice( 0, 4 ) + '-' +
				dateString.slice( 4, 6 ) + '-' +
				dateString.slice( 6, 8 );
			const date = new Date( dateWithDashes );
			dataMap.push( [
				date,
				values[ selectedStats ],
			] );
		}
	} );
	return dataMap;
}

/**
 * Extract the data required from an analytics 'site-analytics' request.
 *
 * @param {object} reports       The data returned from the Analytics API call.
 * @param {array}  selectedStats The currently selected stat we need to return data for.
 * @param {number} days          The number of days to extract data for. Pads empty data days.
 *
 * @return {array} The dataMap ready for charting.
 */
export const extractAnalyticsDashboardData = ( reports, selectedStats, days ) => {
	if ( ! reports || ! reports.length ) {
		return null;
	}
	const { __ } = wp.i18n;

	// Data is returned as an object.
	const rows = reports[0].data.rows;

	if ( ! rows ) {
		return false;
	}

	const rowLength = rows.length;

	// Pad rows to 2 x number of days data points to accomodate new accounts.
	if ( ( days * 2 ) > rowLength ) {
		let date = new Date();
		for ( let i = 0; days > i; i++ ) {
			const month = ( date.getMonth() + 1 ).toString();
			const day = date.getDate().toString();
			const dateString = date.getFullYear().toString() +
				( 2 > month.length ? '0' : '' ) +
				month +
				( 2 > day.length ? '0' : '' ) +
				day;

			if ( i > rowLength ) {
				const emptyWeek = {
					dimensions: [ dateString ],
					metrics: [ { values: [ 0, 0, 0, 0, 0 ] } ],
				};
				rows.unshift( emptyWeek );
			}
			date.setDate( date.getDate() - 1 );
		}
		rows.push( [ 0, 0 ] );
	}

	const dataLabels = [
		__( 'Users', 'google-site-kit' ),
		__( 'Sessions', 'google-site-kit' ),
		__( 'Bounce Rate', 'google-site-kit' ),
		__( 'Session Duration', 'google-site-kit' ),
	];

	const dataMap = [
		[
			{ type: 'date', label: __( 'Day', 'google-site-kit' ) },
			{ type: 'number', label: dataLabels[selectedStats] },
			{ type: 'number', label: __( 'Previous month', 'google-site-kit' ) },
		]
	];

	// Split the results in two chunks of days, and process.
	const lastMonthRows     = rows.slice( rows.length - days, rows.length );
	const previousMonthRows = rows.slice( 0, rows.length - days );
	const lastMonthData     = reduceAnalyticsRowsData( lastMonthRows, selectedStats );
	const previousMonthData = reduceAnalyticsRowsData( previousMonthRows, selectedStats );
	each( lastMonthData, ( row, i ) => {
		if ( row[ 0 ] && row[ 1 ] && previousMonthData[ i ] ) {
			dataMap.push( [
				row[ 0 ],
				row[ 1 ],
				previousMonthData[ i ][ 1 ]
			] );
		}
	} );
	return dataMap;
};

/**
 * Extract the data required from an analytics 'site-analytics' request.
 *
 * @param {object} reports The data returned from the Analytics API call.
 */
export const extractAnalyticsDashboardSparklineData = ( reports ) => {
	if ( ! reports || ! reports.length ) {
		return null;
	}

	// Data is returned as an object.
	const data = reports[0].data.rows;

	const dataMap = [
		[
			{ type: 'date', label: 'Day' },
			{ type: 'number', label: 'Users' },
			{ type: 'number', label: 'Sessions' },
			{ type: 'number', label: 'Goals Completed' },
		]
	];

	each( data, ( row ) => {
		const { values } = row.metrics[0];
		const dateString = row.dimensions[0];
		const dateWithDashes =
			dateString.slice( 0, 4 ) + '-' +
			dateString.slice( 4, 6 ) + '-' +
			dateString.slice( 6, 8 );
		const date = new Date( dateWithDashes );
		dataMap.push( [
			date,
			values[0],
			values[1],
			values[4],
		] );
	} );

	return dataMap;

};

export const calculateOverviewData = ( reports ) => {
	if ( ! reports || ! reports.length ) {
		return false;
	}

	const { totals }     = reports[0].data;
	const lastMonth      = totals[0].values;
	const previousMonth  = totals[1].values;

	const totalUsers                   = lastMonth[0];
	const totalSessions                = lastMonth[1];
	const averageBounceRate            = lastMonth[2];
	const averageSessionDuration       = lastMonth[3];
	const goalCompletions              = lastMonth[4];
	const totalPageViews               = lastMonth[5];
	const totalUsersChange             = changeToPercent( previousMonth[0], lastMonth[0] );
	const totalSessionsChange          = changeToPercent( previousMonth[1], lastMonth[1] );
	const averageBounceRateChange      = changeToPercent( previousMonth[2], lastMonth[2] );
	const averageSessionDurationChange = changeToPercent( previousMonth[3], lastMonth[3] );
	const goalCompletionsChange        = changeToPercent( previousMonth[4], lastMonth[4] );
	const totalPageViewsChange         = changeToPercent( previousMonth[5], lastMonth[5] );

	return {
		totalUsers,
		totalSessions,
		averageBounceRate,
		averageSessionDuration,
		totalUsersChange,
		totalSessionsChange,
		averageBounceRateChange,
		averageSessionDurationChange,
		goalCompletions,
		goalCompletionsChange,
		totalPageViews,
		totalPageViewsChange,
	};
};

/**
 * Translate Analytics API Error Response.
 * See https://developers.google.com/analytics/devguides/reporting/core/v4/errors
 *
 * @param {string} status
 * @param {string} message
 *
 * @returns {string}
 */
export const translateAnalyticsError = ( status, message ) => {
	let translatedMessage = '';

	switch ( status ) {
			case 'INVALID_ARGUMENT':
				translatedMessage = __( 'Analytics module needs to be configured.', 'google-site-kit' );
				break;
			case 'UNAUTHENTICATED':
				translatedMessage = __( 'You need to be authenticated to get this data.', 'google-site-kit' );
				break;
			case 'PERMISSION_DENIED':
				translatedMessage = __( 'Your account does not have sufficient permission to access this data, please consult to your web administrator.', 'google-site-kit' );
				break;
			case 'RESOURCE_EXHAUSTED':
				translatedMessage = __( 'Your account exceeded the maximum quota. Please try again later.', 'google-site-kit' );
				break;
			case 'INTERNAL':
				translatedMessage = __( 'Unexpected internal server error occurred.', 'google-site-kit' );
				break;
			case 'BACKEND_ERROR':
				translatedMessage = __( 'Analytics server returned unknown error. Please try again later.', 'google-site-kit' );
				break;
			case 'UNAVAILABLE':
				translatedMessage = __( 'The service was unable to process the request. Please try again later.', 'google-site-kit' );
				break;
			default:
				translatedMessage = message;
				break;
	}

	return translatedMessage;
};

export const getAnalyticsErrorMessageFromData = ( data ) => {
	if ( data.error && data.error.status ) {
		return translateAnalyticsError( data.error.status, data.error.message );
	}

	return false;
};

/**
 * Check for Zero data from Analytics API.
 *
 * @param {object} data The data returned from the Analytics API call.
 * @returns {boolean}
 */
export const isDataZeroForReporting = ( data ) => {

	// Handle empty data.
	if ( ! data || ! data.length ) {
		return true;
	}

	if ( data && data[ 0 ] && data[ 0 ].data && data[ 0 ].data.totals && data[ 0 ].data.totals[0] ) {
		const { values } = data[ 0 ].data.totals[0];

		// Are all the data points zeros?
		let allZeros = true;
		each( values, ( value ) => {
			if ( 0 !== parseInt( value ) ) {
				allZeros = false;
			}
		} );
		return allZeros;
	}

	return false;
};

/**
 * Check for Zero data from Analytics API 'traffic-sources'.
 *
 * @param {object} data The data returned from the Analytics API call.
 * @returns {boolean}
 */
export const isDataZeroForTrafficSources = ( data ) => {

	// Handle empty data.
	if ( ! data || ! data.length || ! data[0].data ) {
		return true;
	}

	const { totals } = data[0].data;
	const { values } = totals[0];

	if ( '0' === values[0] && '0' === values[1] && '0' === values[2] ) {
		return true;
	}

	return false;
};
