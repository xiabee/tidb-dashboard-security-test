// Copyright 2024 PingCAP, Inc. Licensed under Apache-2.0.

package profiling

import "go.uber.org/fx"

var Module = fx.Options(newFetchers, newService)
