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


import { ClusterinfoClusterStatisticsPartial } from './clusterinfo-cluster-statistics-partial';

/**
 * 
 * @export
 * @interface ClusterinfoClusterStatistics
 */
export interface ClusterinfoClusterStatistics {
    /**
     * 
     * @type {number}
     * @memberof ClusterinfoClusterStatistics
     */
    'probe_failure_hosts'?: number;
    /**
     * 
     * @type {{ [key: string]: ClusterinfoClusterStatisticsPartial; }}
     * @memberof ClusterinfoClusterStatistics
     */
    'stats_by_instance_kind'?: { [key: string]: ClusterinfoClusterStatisticsPartial; };
    /**
     * 
     * @type {ClusterinfoClusterStatisticsPartial}
     * @memberof ClusterinfoClusterStatistics
     */
    'total_stats'?: ClusterinfoClusterStatisticsPartial;
    /**
     * 
     * @type {Array<string>}
     * @memberof ClusterinfoClusterStatistics
     */
    'versions'?: Array<string>;
}

