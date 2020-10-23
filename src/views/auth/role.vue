<template>
  <div class="app-container">
    <div class="filter-container">
      <el-button
        class="filter-item"
        style="margin-left: 10px;"
        type="primary"
        icon="el-icon-edit"
        @click="handleEdit({})"
      >
        {{ $t("table.add") }}
      </el-button>
      <el-button
        v-waves
        :loading="downloadLoading"
        class="filter-item"
        type="primary"
        icon="el-icon-download"
        @click="handleDownload"
      >
        {{ $t("table.export") }}
      </el-button>
    </div>

    <el-table
      :key="tableKey"
      v-loading="listLoading"
      :data="ruleList"
      border
      fit
      highlight-current-row
      style="width: 100%;"
      @sort-change="sortChange"
    >
      <el-table-column
        :label="$t('table.id')"
        prop="id"
        align="center"
        width="80"
      >
        <template slot-scope="{ row }">
          <span>{{ row.id }}</span>
        </template>
      </el-table-column>
      <el-table-column
        :label="$t('authRule.pid')"
        align="center"
        width="80"
      >
        <template slot-scope="{ row }">
          <span>{{ row.pid }}</span>
        </template>
      </el-table-column>
      <el-table-column
        :label="$t('authRule.path')"
        align="center"
      >
        <template slot-scope="{ row }">
          <span>{{ row.path }}</span>
        </template>
      </el-table-column>
      <el-table-column
        :label="$t('authRule.title')"
        prop="id"
        align="center"
      >
        <template slot-scope="{ row }">
          <span>{{ row.title }}</span>
        </template>
      </el-table-column>
      <el-table-column
        :label="$t('authRule.type')"
        prop="id"
        align="center"
      >
        <template slot-scope="{ row }">
          <el-tag :type="'router' === row.type ? 'success' : ''">{{ row.type | typeFilter }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column
        :label="$t('authRule.status')"
        prop="id"
        align="center"
      >
        <template slot-scope="{ row }">
          <el-tag>{{ row.status | typeFilter }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column
        :label="$t('table.actions')"
        align="center"
        width="250"
      >
        <template slot-scope="{ row }">
          <el-button type="primary" @click="handleEdit(row)">{{$t('table.edit')}}</el-button>
          <el-button type="danger" @click="fetchDeleteRule(row)">{{$t('table.delete')}}</el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-dialog :title="textMap[dialogStatus]" :visible.sync="dialogFormVisible">
      <el-form
        ref="dataForm"
        :rules="rules"
        :model="ruleData"
        label-position="left"
        label-width="120px"
        style="padding: 0px 10px"
      >
        <el-form-item :label="$t('table.type')" prop="type">
          <el-radio v-model="ruleData.type" label="router">{{$t('authRule.typeRouter')}}</el-radio>
          <el-radio v-model="ruleData.type" label="api">{{$t('authRule.typeApi')}}</el-radio>
        </el-form-item>

        <el-form-item :label="$t('authRule.pid')">
          <el-select v-model="rulePidValue.title" :clearable="true" placeholder="请选择">
            <el-option value="无" style="height: auto">
              <el-tree 
                :data="ruleSelect" 
                node-key="id" 
                :props="ruleSelectProps" 
                :accordion="true" 
                @node-click="handleNodeClick"
              ></el-tree>
            </el-option>
          </el-select>
        </el-form-item>

        <el-form-item :label="$t('authRule.title')" prop="title">
          <el-input
            v-model="ruleData.title"
            :placeholder="$t('authRule.placeholderTitle')"
          />
        </el-form-item>
        <el-form-item :label="$t('authRule.path')" prop="path">
          <el-input
            v-model="ruleData.path"
            :placeholder="$t('authRule.placeholderPath')"
          />
        </el-form-item>

        <el-form-item :label="$t('authRule.metaTitle')" prop="meta.title">
          <el-input v-model="ruleData.meta.title" />
        </el-form-item>
        <el-form-item :label="$t('authRule.metaComponent')">
          <el-input v-model="ruleData.meta.component" />
        </el-form-item>
        <el-form-item :label="$t('authRule.metaIcon')">
          <icon-picker v-model="ruleData.meta.icon"></icon-picker>
        </el-form-item>

        <el-form-item :label="$t('authRule.sort')">
          <el-slider v-model="ruleData.sort"></el-slider>
        </el-form-item>

        <el-form-item :label="$t('authRule.status')">
          <el-radio v-model="ruleData.status" :label="0">{{$t('authRule.disable')}}</el-radio>
          <el-radio v-model="ruleData.status" :label="1">{{$t('authRule.normal')}}</el-radio>
        </el-form-item>

      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">
          {{ $t("table.cancel") }}
        </el-button>
        <el-button
          type="primary"
          @click="dialogStatus === 'create' ? fetchCreateRule() : fetchUpdateRule()"
        >
          {{ $t("table.confirm") }}
        </el-button>
      </div>
    </el-dialog>

    <el-dialog
      :visible.sync="dialogPageviewsVisible"
      title="Reading statistics"
    >
      <el-table
        :data="pageviewsData"
        border
        fit
        highlight-current-row
        style="width: 100%"
      >
        <el-table-column prop="key" label="Channel" />
        <el-table-column prop="pageviews" label="Pageviews" />
      </el-table>
      <span slot="footer" class="dialog-footer">
        <el-button type="primary" @click="dialogPageviewsVisible = false">{{
          $t("table.confirm")
        }}</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";
import { Form } from "element-ui";
import { cloneDeep } from "lodash";
import { addRule, defaultAuthRule, defaultRuleMeta, defaultRulePid, deleteRules, getAuthRules, getRuleSelect, updateRule } from "@/api/auth"
import { IAuthRuleData, IRulePid } from "@/api/types";
import { exportJson2Excel } from "@/utils/excel";
import { formatJson } from "@/utils";
import Pagination from "@/components/Pagination/index.vue";

const calendarTypeOptions = [
  { key: "CN", displayName: "China" },
  { key: "US", displayName: "USA" },
  { key: "JP", displayName: "Japan" },
  { key: "EU", displayName: "Eurozone" },
  { key: 'router', displayName: '路由地址'},
  { key: 'api', displayName: 'api地址'},
  { key: 0, displayName: '禁用'},
  { key: 1, displayName: '正常'},
];


// arr to obj, such as { CN : "China", US : "USA" }
const calendarTypeKeyValue = calendarTypeOptions.reduce(
  (acc: { [key: string]: string }, cur) => {
    acc[cur.key] = cur.displayName;
    return acc;
  },
  {}
) as { [key: string]: string };

@Component({
  name: "ComplexTable",
  components: {
    Pagination
  },
  filters: {
    typeFilter: (type: string) => {
      return calendarTypeKeyValue[type];
    }
  }
})
export default class extends Vue {
  private tableKey = 0;
  private ruleList: IAuthRuleData[] = [];
  private ruleSelect: IAuthRuleData[] = [];
  private listLoading = true;
  private rulePidValue: IRulePid = {
    id: 0,
    title: '顶级'
  };

  private ruleSelectProps = {
    label: 'title',
    value: 'id',
    children: 'children'
  }

  private importanceOptions = [1, 2, 3];
  private calendarTypeOptions = calendarTypeOptions;
  private sortOptions = [
    { label: "ID Ascending", key: "+id" },
    { label: "ID Descending", key: "-id" }
  ];

  private statusOptions = ["published", "draft", "deleted"];
  private showReviewer = false;
  private dialogFormVisible = false;
  private dialogStatus = "";
  private textMap = {};

  private dialogPageviewsVisible = false;
  private pageviewsData = [];
  private rules = {
    type: [{ required: true, message: "type is required", trigger: "change" }],
    path: [
      { required: true, message: "timestamp is required", trigger: "change" }
    ],
    title: [{ required: true, message: "title is required", trigger: "change" }],
    "meta.title": [{ required: true, message: "metatitle is required", trigger: "change" }],
  };

  private downloadLoading = false;
  private ruleData = defaultAuthRule;

  constructor() {
    super()
    this.textMap = {
      update: this.$t('authRule.ruleUpdate'),
      create: this.$t('authRule.ruleAdd')
    }
  }

  created() {
    this.getRuleSelect()
    this.getList();
  }

  private async getRuleSelect() {
    getRuleSelect().then(res => {
      let { list } = res
      if (list && list.length > 0) {
        list.unshift(defaultRulePid)
      } else {
        list = [defaultRulePid];
      }
      
      this.ruleSelect = list
    }).catch( err => {
      this.$message({
        message: err,
        type: 'error'
      })
    })
  }

  private async getList() {
    this.listLoading = true;

    getAuthRules().then(res => {
      console.log('res', res)
      this.ruleList = res.list;
      this.listLoading = false;
    }).catch(err => {
      this.$message({
        message: err,
        type: 'error'
      })
      this.listLoading = false
    })
  }

  private resetTempRuleData() {
    this.ruleData = cloneDeep(defaultAuthRule);
  }

  private handleNodeClick(data: IRulePid) {
    //树形选择
    this.rulePidValue = {...data};
  }

  private handleEdit(row: IAuthRuleData) {
    if (row && row.id) {
      this.dialogStatus = 'update';
      if (row.meta && typeof row.meta === 'string') {
        row.meta = JSON.parse(row.meta)
      } else {
        row.meta = defaultRuleMeta
      }
      this.ruleData = row
    } else {
      this.dialogStatus = 'create';
      this.resetTempRuleData();
    }
    
    this.dialogFormVisible = true;

    // this.$nextTick(() => {
    //   (this.$refs.dataForm as Form).clearValidate();
    // });
  }

  private getFetchRuleData () {
    let result = { ...this.ruleData, pid: this.rulePidValue.id}
    if (result.meta) {
      result.meta = JSON.stringify(result.meta)
    }
    return result
  }

  private fetchCreateRule() {
    (this.$refs.dataForm as Form).validate(async valid => {
      if (valid) {
        addRule(this.getFetchRuleData()).then(res => {
          this.$notify({
            title: '成功',
            message: '创建成功',
            type: 'success',
            duration: 2000
          })
          this.dialogFormVisible = false
          this.getList()
        })
      }
    });
  }

  private fetchUpdateRule() {
    (this.$refs.dataForm as Form).validate(async valid => {
      if (valid) {
        updateRule(this.getFetchRuleData()).then(res => {
          this.dialogFormVisible = false;
          this.$notify({
            title: "成功",
            message: "更新成功",
            type: "success",
            duration: 2000
          });
          this.getList()
        })
      }
    });
  }

  private fetchDeleteRule(row: IAuthRuleData) {
    deleteRules([row.id]).then(res => {
      this.$notify({
        title: "Success",
        message: "Delete Successfully",
        type: "success",
        duration: 2000
      });
      this.getList()
    })
  }

  private handleDownload() {
    this.downloadLoading = true;
    const tHeader = ["timestamp", "title", "type", "importance", "status"];
    const filterVal = ["timestamp", "title", "type", "importance", "status"];
    const data = formatJson(filterVal, this.ruleList);
    exportJson2Excel(tHeader, data, "table-list");
    this.downloadLoading = false;
  }
}
</script>


<style lang="scss" scoped>
.el-select-dropdown__item {
  padding: 0px;
}
</style>