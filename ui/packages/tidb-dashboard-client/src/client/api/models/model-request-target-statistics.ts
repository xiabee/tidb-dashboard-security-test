/* tslint:disable */
/* eslint-disable */
/**
 * Dashboard API
 * No description provided (generated by Openapi Generator https://github.com/openapitools/openapi-generator)
 *
 * The version of the OpenAPI document: 1.0
 * 
 *
 * NOTE: This class is auto generated by OpenAPI Generator (https://openapi-generator.tech).
 * https://openapi-generator.tech
 * Do not edit the class manually.
 */



/**
 * 
 * @export
 * @interface ModelRequestTargetStatistics
 */
export interface ModelRequestTargetStatistics {
    /**
     * 
     * @type {number}
     * @memberof ModelRequestTargetStatistics
     */
    'num_pd_nodes'?: number;
    /**
     * 
     * @type {number}
     * @memberof ModelRequestTargetStatistics
     */
    'num_ticdc_nodes'?: number;
    /**
     * 
     * @type {number}
     * @memberof ModelRequestTargetStatistics
     */
    'num_tidb_nodes'?: number;
    /**
     * 
     * @type {number}
     * @memberof ModelRequestTargetStatistics
     */
    'num_tiflash_nodes'?: number;
    /**
     * 
     * @type {number}
     * @memberof ModelRequestTargetStatistics
     */
    'num_tikv_nodes'?: number;
    /**
     * 
     * @type {number}
     * @memberof ModelRequestTargetStatistics
     */
    'num_tiproxy_nodes'?: number;
}

