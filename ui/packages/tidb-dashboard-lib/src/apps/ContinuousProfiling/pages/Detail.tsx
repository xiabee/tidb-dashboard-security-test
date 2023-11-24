import { Badge, Button, Modal, Space } from 'antd'
import React, { useCallback, useContext, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { ArrowLeftOutlined } from '@ant-design/icons'
import { useMemoizedFn } from 'ahooks'
import { upperFirst } from 'lodash'
import { IGroup } from 'office-ui-fabric-react/lib/DetailsList'

import { ConprofProfileDetail } from '@lib/client'
import { Card, CardTable, DateTime, Descriptions, Head } from '@lib/components'
import { useClientRequest } from '@lib/utils/useClientRequest'
import { instanceKindName, InstanceKinds } from '@lib/utils/instanceTable'
import useQueryParams from '@lib/utils/useQueryParams'
import { telemetry } from '../utils/telemetry'
import { ScrollablePane } from 'office-ui-fabric-react/lib/ScrollablePane'
import { ConProfilingContext } from '../context'

const COMMON_ACTIONS: string[] = ['view_flamegraph', 'view_graph', 'download']
const TEXT_ACTIONS: string[] = ['view_text']

const profileTypeSortOrder: { [key: string]: number } = {
  profile: 1,
  heap: 2,
  goroutine: 3,
  mutex: 4
}

export default function Page() {
  const ctx = useContext(ConProfilingContext)

  const { t } = useTranslation()
  const { ts } = useQueryParams()

  const {
    data: groupProfileDetail,
    isLoading: groupDetailLoading,
    error: groupDetailError
  } = useClientRequest((reqConfig) =>
    ctx!.ds.continuousProfilingGroupProfileDetailGet(ts, reqConfig)
  )

  const profileDuration = groupProfileDetail?.profile_duration_secs || 0

  const [tableData, groupData] = useMemo(() => {
    const newRows: ConprofProfileDetail[] = []
    const newGroups: IGroup[] = []

    let startIndex = 0
    const profiles = groupProfileDetail?.target_profiles || []
    profiles.sort((a, b) => {
      if (a.target!.component! > b.target!.component!) {
        return 1
      } else {
        return (
          (profileTypeSortOrder[a.profile_type!] ?? 0) -
          (profileTypeSortOrder[b.profile_type!] ?? 0)
        )
      }
    })
    for (const kind of InstanceKinds) {
      profiles.forEach((p) => {
        if (p.target?.component === kind) {
          newRows.push(p)
        }
      })

      if (newRows.length - startIndex > 0) {
        newGroups.push({
          key: instanceKindName(kind),
          name: instanceKindName(kind),
          startIndex: startIndex,
          count: newRows.length - startIndex
        })
        startIndex = newRows.length
      }
    }

    return [newRows, newGroups]
  }, [groupProfileDetail])

  const handleClick = useMemoizedFn(
    async (action: string, rec: ConprofProfileDetail) => {
      const { profile_type, target } = rec
      const { component, address } = target!
      let dataFormat = ''
      if (component === 'tikv' && profile_type === 'heap') {
        switch (action) {
          case 'view_flamegraph':
            // tikv heap flamegraph uses Brendan Gregg's collapsed stack format which is text based
            dataFormat = 'text'
            break
          case 'view_graph':
            dataFormat = 'svg'
            break
          case 'download':
            dataFormat = 'jeprof'
            break
          default:
        }
      } else {
        switch (action) {
          case 'view_graph':
            dataFormat = 'svg'
            break
          case 'view_text':
            dataFormat = 'text'
            break
          case 'view_flamegraph':
          case 'download':
            dataFormat = 'protobuf'
            break
          default:
        }
      }
      const res = await ctx!.ds.continuousProfilingActionTokenGet(
        `ts=${ts}&profile_type=${profile_type}&component=${component}&address=${address}&data_format=${dataFormat}`
      )
      const token = res.data
      if (!token) {
        return
      }

      telemetry.clickAction({
        action,
        profile_type: rec.profile_type!,
        component: component!
      })

      if (action === 'view_graph' || action === 'view_text') {
        const profileURL = `${
          ctx!.cfg.apiPathBase
        }/continuous_profiling/single_profile/view?token=${token}`
        window.open(profileURL, '_blank')
        return
      }

      if (action === 'view_flamegraph') {
        // view flamegraph by speedscope
        const speedscopeTitle = `${rec.target?.component}_${rec.target?.address}_${rec.profile_type}`
        const profileURL = `${
          ctx!.cfg.apiPathBase
        }/continuous_profiling/single_profile/view?token=${token}`
        const speedscopeURL = `${
          ctx!.cfg.publicPathBase
        }/speedscope/#profileURL=${encodeURIComponent(
          profileURL + `&output_type=${dataFormat}`
        )}&title=${speedscopeTitle}`
        window.open(speedscopeURL, '_blank')
        return
      }

      if (action === 'download') {
        window.location.href = `${
          ctx!.cfg.apiPathBase
        }/continuous_profiling/download?token=${token}`
        return
      }
    }
  )

  const handleDownloadGroup = useCallback(async () => {
    const res = await ctx!.ds.continuousProfilingActionTokenGet(
      `ts=${ts}&data_format=protobuf`
    )
    const token = res.data
    if (!token) {
      return
    }
    telemetry.downloadProfilingGroupResult()
    window.location.href = `${
      ctx!.cfg.apiPathBase
    }/continuous_profiling/download?token=${token}`
  }, [ts, ctx])

  const columns = useMemo(
    () => [
      {
        name: t('conprof.detail.table.columns.instance'),
        key: 'instance',
        minWidth: 100,
        maxWidth: 200,
        onRender: (record) => record.target.address
      },
      {
        name: t('conprof.detail.table.columns.content'),
        key: 'content',
        minWidth: 100,
        maxWidth: 100,
        onRender: (record) => {
          const profileType = record.profile_type
          if (profileType === 'profile') {
            return `CPU - ${profileDuration}s`
          }
          return upperFirst(profileType)
        }
      },
      {
        name: t('conprof.detail.table.columns.status'),
        key: 'status',
        minWidth: 100,
        maxWidth: 150,
        onRender: (record) => {
          if (record.state === 'finished' || record.state === 'success') {
            return (
              <Badge
                status="success"
                text={t('conprof.detail.table.status.finished')}
              />
            )
          }
          if (record.state === 'failed') {
            return (
              <Badge
                status="error"
                text={t('conprof.detail.table.status.error')}
              />
            )
          }
          return <Badge text={t('conprof.list.table.status.unknown')} />
        }
      },
      {
        name: t('conprof.detail.table.columns.view_as.title'),
        key: 'view_as',
        minWidth: 250,
        maxWidth: 400,
        onRender: (record) => {
          if (record.state === 'failed') {
            return (
              <a
                onClick={() => {
                  Modal.error({
                    title: 'Profile Error',
                    content: record.error
                  })
                }}
              >
                {t('conprof.detail.table.columns.view_as.error')}
              </a>
            )
          }

          if (record.state !== 'finished' && record.state !== 'success') {
            return <></>
          }

          const rec = record as ConprofProfileDetail
          let actionsKey = TEXT_ACTIONS
          if (rec.profile_type !== 'goroutine') {
            actionsKey = COMMON_ACTIONS
          }

          return (
            <Space>
              {actionsKey.map((action) => {
                return (
                  <a onClick={() => handleClick(action, record)} key={action}>
                    {t(`conprof.detail.table.columns.view_as.${action}`)}
                  </a>
                )
              })}
            </Space>
          )
        }
      }
    ],
    [t, profileDuration, handleClick]
  )

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Head
        title={t('conprof.detail.head.title')}
        back={
          <Link to={`/continuous_profiling`}>
            <ArrowLeftOutlined /> {t('conprof.detail.head.back')}
          </Link>
        }
        titleExtra={
          <Button type="primary" onClick={handleDownloadGroup}>
            {t('conprof.detail.download')}
          </Button>
        }
      />
      <div style={{ height: '100%', position: 'relative' }}>
        <ScrollablePane>
          {groupProfileDetail && (
            <Card noMarginTop noMarginBottom>
              <Descriptions>
                <Descriptions.Item
                  span={2}
                  label={t('conprof.detail.head.start_at')}
                >
                  <DateTime.Long
                    unixTimestampMs={groupProfileDetail.ts! * 1000}
                  />
                </Descriptions.Item>
              </Descriptions>
            </Card>
          )}
          <CardTable
            cardNoMarginTop
            cardNoMarginBottom
            disableSelectionZone
            loading={groupDetailLoading}
            columns={columns}
            items={tableData}
            groups={groupData}
            errors={[groupDetailError]}
            hideLoadingWhenNotEmpty
            extendLastColumn
            compact
          />
        </ScrollablePane>
      </div>
    </div>
  )
}
