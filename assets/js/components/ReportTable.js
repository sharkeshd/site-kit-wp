/**
 * Report Table component.
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
 * External dependencies
 */
import classnames from 'classnames';
import get from 'lodash/get';
import PropTypes from 'prop-types';

export default function ReportTable( { rows, columns, className } ) {
	return (
		<div
			className={ classnames(
				'googlesitekit-table',
				'googlesitekit-table--with-list',
				className,
			) }
		>
			<table
				className={ classnames(
					'googlesitekit-table__wrapper',
					`googlesitekit-table__wrapper--${ columns.length }-col`,
				) }
			>
				<thead className="googlesitekit-table__head">
					<tr className="googlesitekit-table__head-row">
						{ columns.map(
							( { title, description, primary, className: columnClassName }, colIndex ) => (
								<th
									className={ classnames(
										'googlesitekit-table__head-item',
										{ 'googlesitekit-table__head-item--primary': primary },
										columnClassName,
									) }
									data-tooltip={ description }
									key={ `googlesitekit-table__head-row-${ colIndex }` }
								>
									{ title }
								</th>
							)
						) }
					</tr>
				</thead>

				<tbody className="googlesitekit-table__body">
					{ rows.map( ( row, rowIndex ) => (
						<tr
							className="googlesitekit-table__body-row"
							key={ `googlesitekit-table__body-row-${ rowIndex }` }
						>
							{ columns
								.filter( ( { Component, field } ) => Component || field )
								.map( ( { Component, field, className: columnClassName }, colIndex ) => {
									const fieldValue = field && get( row, field );
									return (
										<td
											key={ `googlesitekit-table__body-item-${ colIndex }` }
											className={ classnames(
												'googlesitekit-table__body-item',
												columnClassName
											) }
										>
											<div className="googlesitekit-table__body-item-content">
												{ Component && <Component row={ row } fieldValue={ fieldValue } /> }
												{ ! Component && fieldValue }
											</div>
										</td>
									);
								} )
							}
						</tr>
					) ) }
				</tbody>
			</table>
		</div>
	);
}

ReportTable.propTypes = {
	rows: PropTypes.arrayOf(
		PropTypes.oneOfType(
			[
				PropTypes.array,
				PropTypes.object,
			]
		)
	).isRequired,
	columns: PropTypes.arrayOf(
		PropTypes.shape( {
			title: PropTypes.string,
			description: PropTypes.string,
			primary: PropTypes.bool,
			className: PropTypes.string,
			field: PropTypes.string,
			Component: PropTypes.componentType,
		} )
	).isRequired,
	className: PropTypes.string,
};
