<?php
/**
 * Class Google\Site_Kit\Core\CLI\CLI_Commands
 *
 * @package   Google\Site_Kit\Core\CLI
 * @copyright 2020 Google LLC
 * @license   https://www.apache.org/licenses/LICENSE-2.0 Apache License 2.0
 * @link      https://sitekit.withgoogle.com
 */

namespace Google\Site_Kit\Core\CLI;

use Google\Site_Kit\Context;

/**
 * CLI commands hub class.
 *
 * @since n.e.x.t
 */
class CLI_Commands {

	/**
	 * Plugin context.
	 *
	 * @since n.e.x.t
	 *
	 * @access private
	 * @var \Google\Site_Kit\Context
	 */
	private $context;

	/**
	 * Constructor.
	 *
	 * @since n.e.x.t
	 *
	 * @access public
	 * @param \Google\Site_Kit\Context $context Plugin context.
	 */
	public function __construct( Context $context ) {
		$this->context = $context;
	}

	/**
	 * Registers WP CLI commands.
	 *
	 * @since n.e.x.t
	 *
	 * @access public
	 */
	public function register() {
		\WP_CLI::add_command( 'google-site-kit reset', new Reset_CLI_Command( $this->context ) );
		\WP_CLI::add_command( 'google-site-kit auth', new Authentication_CLI_Command( $this->context ) );
	}

}
