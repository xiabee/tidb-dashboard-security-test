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


import { HostinfoInfo } from './hostinfo-info';
import { RestErrorResponse } from './rest-error-response';

/**
 * 
 * @export
 * @interface ClusterinfoGetHostsInfoResponse
 */
export interface ClusterinfoGetHostsInfoResponse {
    /**
     * 
     * @type {Array<HostinfoInfo>}
     * @memberof ClusterinfoGetHostsInfoResponse
     */
    'hosts'?: Array<HostinfoInfo>;
    /**
     * 
     * @type {RestErrorResponse}
     * @memberof ClusterinfoGetHostsInfoResponse
     */
    'warning'?: RestErrorResponse;
}

