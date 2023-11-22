import {
  IMonitoringDataSource,
  IMonitoringContext,
  ReqConfig
} from '@pingcap/tidb-dashboard-lib'

import client, { MetricsQueryResponse } from '~/client'
import { IGlobalConfig } from '~/utils/global-config'

import { getMonitoringItems } from './metricsQueries'

class DataSource implements IMonitoringDataSource {
  constructor(public globalConfig: IGlobalConfig) {}

  // use arrow function to make the `this` not undefined inside the method
  metricsQueryGet = (params: {
    endTimeSec?: number
    query?: string
    startTimeSec?: number
    stepSec?: number
  }) => {
    if (this.globalConfig.promBaseUrl) {
      return client
        .getAxiosInstance()
        .get<MetricsQueryResponse>(
          this.globalConfig.promBaseUrl + '/api/v1/query_range',
          {
            params: {
              query: params.query,
              step: params.stepSec,
              start: params.startTimeSec,
              end: params.endTimeSec
            }
          }
        )
        .then((res) => res.data)
    }
    return client
      .getInstance()
      .metricsQueryGet(params, {
        handleError: 'custom'
      } as ReqConfig)
      .then((res) => res.data)
  }
}

export const ctx: (globalConfig: IGlobalConfig) => IMonitoringContext = (
  globalConfig
) => {
  const isDedicated = globalConfig.clusterInfo.deployType === 'Dedicated'
  const RECENT_SECONDS = globalConfig.expandMetricsData
    ? isDedicated
      ? [
          5 * 60,
          15 * 60,
          30 * 60,
          60 * 60,
          3 * 60 * 60,
          12 * 60 * 60,
          24 * 60 * 60,
          3 * 24 * 60 * 60,
          7 * 24 * 60 * 60
        ]
      : [
          5 * 60,
          15 * 60,
          30 * 60,
          60 * 60,
          3 * 60 * 60,
          12 * 60 * 60,
          24 * 60 * 60,
          2 * 24 * 60 * 60,
          3 * 24 * 60 * 60
        ]
    : [
        5 * 60,
        15 * 60,
        30 * 60,
        60 * 60,
        3 * 60 * 60,
        6 * 60 * 60,
        12 * 60 * 60,
        24 * 60 * 60,
        2 * 24 * 60 * 60
      ]

  return {
    ds: new DataSource(globalConfig),
    cfg: {
      getMetricsQueries: (pdVersion: string | undefined) =>
        getMonitoringItems(
          pdVersion,
          globalConfig.clusterInfo.deployType,
          globalConfig.enableNodeMetrics
        ),
      timeRangeSelector: {
        recent_seconds: RECENT_SECONDS,
        customAbsoluteRangePicker: true
      },
      metricsReferenceLink: isDedicated
        ? 'https://docs.pingcap.com/tidbcloud/built-in-monitoring'
        : ''
    }
  }
}
