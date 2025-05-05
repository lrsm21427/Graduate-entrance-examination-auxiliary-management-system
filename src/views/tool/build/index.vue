<template>
  <div class="container">
    <div class="left-board">
      <div class="logo-wrapper">
        <div class="logo">
          <img :src="logo" alt="logo"> Form Generator
        </div>
      </div>
      <el-scrollbar class="left-scrollbar">
        <div class="components-list">
          <div class="components-title">
            <svg-icon icon-class="component" />输入型组件
          </div>
          <draggable
            class="components-draggable"
            :list="inputComponents"
            :group="{ name: 'componentsGroup', pull: 'clone', put: false }"
            :clone="cloneComponent"
            draggable=".components-item"
            :sort="false"
            @end="onEnd"
          >
            <div
              v-for="(element, index) in inputComponents" :key="index" class="components-item"
              @click="addComponent(element)"
            >
              <div class="components-body">
                <svg-icon :icon-class="element.tagIcon" />
                {{ element.label }}
              </div>
            </div>
          </draggable>
          <div class="components-title">
            <svg-icon icon-class="component" />选择型组件
          </div>
          <draggable
            class="components-draggable"
            :list="selectComponents"
            :group="{ name: 'componentsGroup', pull: 'clone', put: false }"
            :clone="cloneComponent"
            draggable=".components-item"
            :sort="false"
            @end="onEnd"
          >
            <div
              v-for="(element, index) in selectComponents"
              :key="index"
              class="components-item"
              @click="addComponent(element)"
            >
              <div class="components-body">
                <svg-icon :icon-class="element.tagIcon" />
                {{ element.label }}
              </div>
            </div>
          </draggable>
          <div class="components-title">
            <svg-icon icon-class="component" /> 布局型组件
          </div>
          <draggable
            class="components-draggable" :list="layoutComponents"
            :group="{ name: 'componentsGroup', pull: 'clone', put: false }" :clone="cloneComponent"
            draggable=".components-item" :sort="false" @end="onEnd"
          >
            <div
              v-for="(element, index) in layoutComponents" :key="index" class="components-item"
              @click="addComponent(element)"
            >
              <div class="components-body">
                <svg-icon :icon-class="element.tagIcon" />
                {{ element.label }}
              </div>
            </div>
          </draggable>
        </div>
      </el-scrollbar>
    </div>

    <div class="center-board">
      <div class="action-bar">
        <el-button icon="el-icon-download" type="text" @click="download">
          导出vue文件
        </el-button>
        <el-button class="copy-btn-main" icon="el-icon-document-copy" type="text" @click="copy">
          复制代码
        </el-button>
        <el-button class="delete-btn" icon="el-icon-delete" type="text" @click="empty">
          清空
        </el-button>
      </div>
      <el-scrollbar class="center-scrollbar">
        <el-row class="center-board-row" :gutter="formConf.gutter">
          <el-form
            :size="formConf.size"
            :label-position="formConf.labelPosition"
            :disabled="formConf.disabled"
            :label-width="formConf.labelWidth + 'px'"
          >
            <draggable class="drawing-board" :list="drawingList" :animation="340" group="componentsGroup">
              <draggable-item
                v-for="(element, index) in drawingList"
                :key="element.renderKey"
                :drawing-list="drawingList"
                :element="element"
                :index="index"
                :active-id="activeId"
                :form-conf="formConf"
                @activeItem="activeFormItem"
                @copyItem="drawingItemCopy"
                @deleteItem="drawingItemDelete"
              />
            </draggable>
            <div v-show="!drawingList.length" class="empty-info">
              从左侧拖入或点选组件进行表单设计
            </div>
          </el-form>
        </el-row>
      </el-scrollbar>
    </div>

    <right-panel
      :active-data="activeData"
      :form-conf="formConf"
      :show-field="!!drawingList.length"
      @tag-change="tagChange"
    />

    <code-type-dialog
      :visible.sync="dialogVisible"
      title="选择生成类型"
      :show-file-name="showFileName"
      @confirm="generate"
    />
    <input id="copyNode" type="hidden">
  </div>
</template>

<script>
import draggable from 'vuedraggable'
import beautifier from 'js-beautify'
import ClipboardJS from 'clipboard'
import render from '@/utils/generator/render'
import RightPanel from './RightPanel'
import { inputComponents, selectComponents, layoutComponents, formConf } from '@/utils/generator/config'
import { beautifierConf, titleCase } from '@/utils/index'
import { makeUpHtml, vueTemplate, vueScript, cssStyle } from '@/utils/generator/html'
import { makeUpJs } from '@/utils/generator/js'
import { makeUpCss } from '@/utils/generator/css'
import drawingDefault from '@/utils/generator/drawingDefault'
import logo from '@/assets/logo/logo.png'
import CodeTypeDialog from './CodeTypeDialog'
import DraggableItem from './DraggableItem'

let oldActiveId
let tempActiveData

export default {
  components: {
    draggable,
    render,
    RightPanel,
    CodeTypeDialog,
    DraggableItem
  },
  data() {
    return {
      logo,
      idGlobal: 100,
      formConf,
      inputComponents,
      selectComponents,
      layoutComponents,
      labelWidth: 100,
      drawingList: drawingDefault,
      drawingData: {},
      activeId: drawingDefault[0].formId,
      drawerVisible: false,
      formData: {},
      dialogVisible: false,
      generateConf: null,
      showFileName: false,
      activeData: drawingDefault[0]
    }
  },
  created() {
    // 防止 firefox 下 拖拽 会新打卡一个选项卡
    document.body.ondrop = event => {
      event.preventDefault()
      event.stopPropagation()
    }
  },
  watch: {
    // eslint-disable-next-line func-names
    'activeData.label': function (val, oldVal) {
      if (
        this.activeData.placeholder === undefined
        || !this.activeData.tag
        || oldActiveId !== this.activeId
      ) {
        return
      }
      this.activeData.placeholder = this.activeData.placeholder.replace(oldVal, '') + val
    },
    activeId: {
      handler(val) {
        oldActiveId = val
      },
      immediate: true
    }
  },
  mounted() {
    const clipboard = new ClipboardJS('#copyNode', {
      text: trigger => {
        const codeStr = this.generateCode()
        this.$notify({
          title: '成功',
          message: '代码已复制到剪切板，可粘贴。',
          type: 'success'
        })
        return codeStr
      }
    })
    clipboard.on('error', e => {
      this.$message.error('代码复制失败')
    })
  },
  methods: {
    activeFormItem(element) {
      this.activeData = element
      this.activeId = element.formId
    },
    onEnd(obj, a) {
      if (obj.from !== obj.to) {
        this.activeData = tempActiveData
        this.activeId = this.idGlobal
      }
    },
    addComponent(item) {
      const clone = this.cloneComponent(item)
      this.drawingList.push(clone)
      this.activeFormItem(clone)
    },
    cloneComponent(origin) {
      const clone = JSON.parse(JSON.stringify(origin))
      clone.formId = ++this.idGlobal
      clone.span = formConf.span
      clone.renderKey = +new Date() // 改变renderKey后可以实现强制更新组件
      if (!clone.layout) clone.layout = 'colFormItem'
      if (clone.layout === 'colFormItem') {
        clone.vModel = `field${this.idGlobal}`
        clone.placeholder !== undefined && (clone.placeholder += clone.label)
        tempActiveData = clone
      } else if (clone.layout === 'rowFormItem') {
        delete clone.label
        clone.componentName = `row${this.idGlobal}`
        clone.gutter = this.formConf.gutter
        tempActiveData = clone
      }
      return tempActiveData
    },
    AssembleFormData() {
      this.formData = {
        fields: JSON.parse(JSON.stringify(this.drawingList)),
        ...this.formConf
      }
    },
    generate(data) {
      const func = this[`exec${titleCase(this.operationType)}`]
      this.generateConf = data
      func && func(data)
    },
    execRun(data) {
      this.AssembleFormData()
      this.drawerVisible = true
    },
    execDownload(data) {
      const codeStr = this.generateCode()
      const blob = new Blob([codeStr], { type: 'text/plain;charset=utf-8' })
      this.$download.saveAs(blob, data.fileName)
    },
    execCopy(data) {
      document.getElementById('copyNode').click()
    },
    empty() {
      this.$confirm('确定要清空所有组件吗？', '提示', { type: 'warning' }).then(
        () => {
          this.drawingList = []
        }
      )
    },
    drawingItemCopy(item, parent) {
      let clone = JSON.parse(JSON.stringify(item))
      clone = this.createIdAndKey(clone)
      parent.push(clone)
      this.activeFormItem(clone)
    },
    createIdAndKey(item) {
      item.formId = ++this.idGlobal
      item.renderKey = +new Date()
      if (item.layout === 'colFormItem') {
        item.vModel = `field${this.idGlobal}`
      } else if (item.layout === 'rowFormItem') {
        item.componentName = `row${this.idGlobal}`
      }
      if (Array.isArray(item.children)) {
        item.children = item.children.map(childItem => this.createIdAndKey(childItem))
      }
      return item
    },
    drawingItemDelete(index, parent) {
      parent.splice(index, 1)
      this.$nextTick(() => {
        const len = this.drawingList.length
        if (len) {
          this.activeFormItem(this.drawingList[len - 1])
        }
      })
    },
    generateCode() {
      const { type } = this.generateConf
      this.AssembleFormData()
      const script = vueScript(makeUpJs(this.formData, type))
      const html = vueTemplate(makeUpHtml(this.formData, type))
      const css = cssStyle(makeUpCss(this.formData))
      return beautifier.html(html + script + css, beautifierConf.html)
    },
    download() {
      this.dialogVisible = true
      this.showFileName = true
      this.operationType = 'download'
    },
    run() {
      this.dialogVisible = true
      this.showFileName = false
      this.operationType = 'run'
    },
    copy() {
      this.dialogVisible = true
      this.showFileName = false
      this.operationType = 'copy'
    },
    tagChange(newTag) {
      newTag = this.cloneComponent(newTag)
      newTag.vModel = this.activeData.vModel
      newTag.formId = this.activeId
      newTag.span = this.activeData.span
      delete this.activeData.tag
      delete this.activeData.tagIcon
      delete this.activeData.document
      Object.keys(newTag).forEach(key => {
        if (this.activeData[key] !== undefined
          && typeof this.activeData[key] === typeof newTag[key]) {
          newTag[key] = this.activeData[key]
        }
      })
      this.activeData = newTag
      this.updateDrawingList(newTag, this.drawingList)
    },
    updateDrawingList(newTag, list) {
      const index = list.findIndex(item => item.formId === this.activeId)
      if (index > -1) {
        list.splice(index, 1, newTag)
      } else {
        list.forEach(item => {
          if (Array.isArray(item.children)) this.updateDrawingList(newTag, item.children)
        })
      }
    }
  }
}
</script>

<style lang='scss'>
.editor-tabs{
  background: #121315;
  .el-tabs__header{
    margin: 0;
    border-bottom-color: #121315;
    .el-tabs__nav{
      border-color: #121315;
    }
  }
  .el-tabs__item{
    height: 32px;
    line-height: 32px;
    color: #888a8e;
    border-left: 1px solid #121315 !important;
    background: #363636;
    margin-right: 5px;
    user-select: none;
  }
  .el-tabs__item.is-active{
    background: #1e1e1e;
    border-bottom-color: #1e1e1e!important;
    color: #fff;
  }
  .el-icon-edit{
    color: #f1fa8c;
  }
  .el-icon-document{
    color: #a95812;
  }
}

// home
.right-scrollbar {
  .el-scrollbar__view {
    padding: 12px 18px 15px 15px;
    background-image: url("data:image/svg+xml;charset=utf-8;base64,PHN2ZyB4bWxucz0naHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmcnIHdpZHRoPScxOTInIGhlaWdodD0nMTkyJyB2aWV3Qm94PScwIDAgMTkyIDE5Mic+PHBhdGggZmlsbD0nIzQ5NDg0OScgZmlsbC1vcGFjaXR5PScwLjA4JyBkPSdNMTkyIDE1djJhMTEgMTEgMCAwIDAtMTEgMTFjMCAxLjk0IDEuMTYgNC43NSAyLjUzIDYuMTFsMi4zNiAyLjM2YTYuOTMgNi45MyAwIDAgMSAxLjIyIDcuNTZsLS40My44NGE4LjA4IDguMDggMCAwIDEtNi42NiA0LjEzSDE0NXYzNS4wMmE2LjEgNi4xIDAgMCAwIDMuMDMgNC44N2wuODQuNDNjMS41OC43OSA0IC40IDUuMjQtLjg1bDIuMzYtMi4zNmExMi4wNCAxMi4wNCAwIDAgMSA3LjUxLTMuMTEgMTMgMTMgMCAxIDEgLjAyIDI2IDEyIDEyIDAgMCAxLTcuNTMtMy4xMWwtMi4zNi0yLjM2YTQuOTMgNC45MyAwIDAgMC01LjI0LS44NWwtLjg0LjQzYTYuMSA2LjEgMCAwIDAtMy4wMyA0Ljg3VjE0M2gzNS4wMmE4LjA4IDguMDggMCAwIDEgNi42NiA0LjEzbC40My44NGE2LjkxIDYuOTEgMCAwIDEtMS4yMiA3LjU2bC0yLjM2IDIuMzZBMTAuMDYgMTAuMDYgMCAwIDAgMTgxIDE2NGExMSAxMSAwIDAgMCAxMSAxMXYyYTEzIDEzIDAgMCAxLTEzLTEzIDEyIDEyIDAgMCAxIDMuMTEtNy41M2wyLjM2LTIuMzZhNC45MyA0LjkzIDAgMCAwIC44NS01LjI0bC0uNDMtLjg0YTYuMSA2LjEgMCAwIDAtNC44Ny0zLjAzSDE0NXYzNS4wMmE4LjA4IDguMDggMCAwIDEtNC4xMyA2LjY2bC0uODQuNDNhNi45MSA2LjkxIDAgMCAxLTcuNTYtMS4yMmwtMi4zNi0yLjM2QTEwLjA2IDEwLjA2IDAgMCAwIDEyNCAxODFhMTEgMTEgMCAwIDAtMTEgMTFoLTJhMTMgMTMgMCAwIDEgMTMtMTNjMi40NyAwIDUuNzkgMS4zNyA3LjUzIDMuMTFsMi4zNiAyLjM2YTQuOTQgNC45NCAwIDAgMCA1LjI0Ljg1bC44NC0uNDNhNi4xIDYuMSAwIDAgMCAzLjAzLTQuODdWMTQ1aC0zNS4wMmE4LjA4IDguMDggMCAwIDEtNi42Ni00LjEzbC0uNDMtLjg0YTYuOTEgNi45MSAwIDAgMSAxLjIyLTcuNTZsMi4zNi0yLjM2QTEwLjA2IDEwLjA2IDAgMCAwIDEwNyAxMjRhMTEgMTEgMCAwIDAtMjIgMGMwIDEuOTQgMS4xNiA0Ljc1IDIuNTMgNi4xMWwyLjM2IDIuMzZhNi45MyA2LjkzIDAgMCAxIDEuMjIgNy41NmwtLjQzLjg0YTguMDggOC4wOCAwIDAgMS02LjY2IDQuMTNINDl2MzUuMDJhNi4xIDYuMSAwIDAgMCAzLjAzIDQuODdsLjg0LjQzYzEuNTguNzkgNCAuNCA1LjI0LS44NWwyLjM2LTIuMzZhMTIuMDQgMTIuMDQgMCAwIDEgNy41MS0zLjExQTEzIDEzIDAgMCAxIDgxIDE5MmgtMmExMSAxMSAwIDAgMC0xMS0xMWMtMS45NCAwLTQuNzUgMS4xNi02LjExIDIuNTNsLTIuMzYgMi4zNmE2LjkzIDYuOTMgMCAwIDEtNy41NiAxLjIybC0uODQtLjQzYTguMDggOC4wOCAwIDAgMS00LjEzLTYuNjZWMTQ1SDExLjk4YTYuMSA2LjEgMCAwIDAtNC44NyAzLjAzbC0uNDMuODRjLS43OSAxLjU4LS40IDQgLjg1IDUuMjRsMi4zNiAyLjM2YTEyLjA0IDEyLjA0IDAgMCAxIDMuMTEgNy41MUExMyAxMyAwIDAgMSAwIDE3N3YtMmExMSAxMSAwIDAgMCAxMS0xMWMwLTEuOTQtMS4xNi00Ljc1LTIuNTMtNi4xMWwtMi4zNi0yLjM2YTYuOTMgNi45MyAwIDAgMS0xLjIyLTcuNTZsLjQzLS44NGE4LjA4IDguMDggMCAwIDEgNi42Ni00LjEzSDQ3di0zNS4wMmE2LjEgNi4xIDAgMCAwLTMuMDMtNC44N2wtLjg0LS40M2MtMS41OS0uOC00LS40LTUuMjQuODVsLTIuMzYgMi4zNkExMiAxMiAwIDAgMSAyOCAxMDlhMTMgMTMgMCAxIDEgMC0yNmMyLjQ3IDAgNS43OSAxLjM3IDcuNTMgMy4xMWwyLjM2IDIuMzZhNC45NCA0Ljk0IDAgMCAwIDUuMjQuODVsLjg0LS40M0E2LjEgNi4xIDAgMCAwIDQ3IDg0LjAyVjQ5SDExLjk4YTguMDggOC4wOCAwIDAgMS02LjY2LTQuMTNsLS40My0uODRhNi45MSA2LjkxIDAgMCAxIDEuMjItNy41NmwyLjM2LTIuMzZBMTAuMDYgMTAuMDYgMCAwIDAgMTEgMjggMTEgMTEgMCAwIDAgMCAxN3YtMmExMyAxMyAwIDAgMSAxMyAxM2MwIDIuNDctMS4zNyA1Ljc5LTMuMTEgNy41M2wtMi4zNiAyLjM2YTQuOTQgNC45NCAwIDAgMC0uODUgNS4yNGwuNDMuODRBNi4xIDYuMSAwIDAgMCAxMS45OCA0N0g0N1YxMS45OGE4LjA4IDguMDggMCAwIDEgNC4xMy02LjY2bC44NC0uNDNhNi45MSA2LjkxIDAgMCAxIDcuNTYgMS4yMmwyLjM2IDIuMzZBMTAuMDYgMTAuMDYgMCAwIDAgNjggMTEgMTEgMTEgMCAwIDAgNzkgMGgyYTEzIDEzIDAgMCAxLTEzIDEzIDEyIDEyIDAgMCAxLTcuNTMtMy4xMWwtMi4zNi0yLjM2YTQuOTMgNC45MyAwIDAgMC01LjI0LS44NWwtLjg0LjQzQTYuMSA2LjEgMCAwIDAgNDkgMTEuOThWNDdoMzUuMDJhOC4wOCA4LjA4IDAgMCAxIDYuNjYgNC4xM2wuNDMuODRhNi45MSA2LjkxIDAgMCAxLTEuMjIgNy41NmwtMi4zNiAyLjM2QTEwLjA2IDEwLjA2IDAgMCAwIDg1IDY4YTExIDExIDAgMCAwIDIyIDBjMC0xLjk0LTEuMTYtNC43NS0yLjUzLTYuMTFsLTIuMzYtMi4zNmE2LjkzIDYuOTMgMCAwIDEtMS4yMi03LjU2bC40My0uODRhOC4wOCA4LjA4IDAgMCAxIDYuNjYtNC4xM0gxNDNWMTEuOThhNi4xIDYuMSAwIDAgMC0zLjAzLTQuODdsLS44NC0uNDNjLTEuNTktLjgtNC0uNC01LjI0Ljg1bC0yLjM2IDIuMzZBMTIgMTIgMCAwIDEgMTI0IDEzYTEzIDEzIDAgMCAxLTEzLTEzaDJhMTEgMTEgMCAwIDAgMTEgMTFjMS45NCAwIDQuNzUtMS4xNiA2LjExLTIuNTNsMi4zNi0yLjM2YTYuOTMgNi45MyAwIDAgMSA3LjU2LTEuMjJsLjg0LjQzYTguMDggOC4wOCAwIDAgMSA0LjEzIDYuNjZWNDdoMzUuMDJhNi4xIDYuMSAwIDAgMCA0Ljg3LTMuMDNsLjQzLS44NGMuOC0xLjU5LjQtNC0uODUtNS4yNGwtMi4zNi0yLjM2QTEyIDEyIDAgMCAxIDE3OSAyOGExMyAxMyAwIDAgMSAxMy0xM3pNODQuMDIgMTQzYTYuMSA2LjEgMCAwIDAgNC44Ny0zLjAzbC40My0uODRjLjgtMS41OS40LTQtLjg1LTUuMjRsLTIuMzYtMi4zNkExMiAxMiAwIDAgMSA4MyAxMjRhMTMgMTMgMCAxIDEgMjYgMGMwIDIuNDctMS4zNyA1Ljc5LTMuMTEgNy41M2wtMi4zNiAyLjM2YTQuOTQgNC45NCAwIDAgMC0uODUgNS4yNGwuNDMuODRhNi4xIDYuMSAwIDAgMCA0Ljg3IDMuMDNIMTQzdi0zNS4wMmE4LjA4IDguMDggMCAwIDEgNC4xMy02LjY2bC44NC0uNDNhNi45MSA2LjkxIDAgMCAxIDcuNTYgMS4yMmwyLjM2IDIuMzZBMTAuMDYgMTAuMDYgMCAwIDAgMTY0IDEwN2ExMSAxMSAwIDAgMCAwLTIyYy0xLjk0IDAtNC43NSAxLjE2LTYuMTEgMi41M2wtMi4zNiAyLjM2YTYuOTMgNi45MyAwIDAgMS03LjU2IDEuMjJsLS44NC0uNDNhOC4wOCA4LjA4IDAgMCAxLTQuMTMtNi42NlY0OWgtMzUuMDJhNi4xIDYuMSAwIDAgMC00Ljg3IDMuMDNsLS40My44NGMtLjc5IDEuNTgtLjQgNCAuODUgNS4yNGwyLjM2IDIuMzZhMTIuMDQgMTIuMDQgMCAwIDEgMy4xMSA3LjUxQTEzIDEzIDAgMSAxIDgzIDY4YTEyIDEyIDAgMCAxIDMuMTEtNy41M2wyLjM2LTIuMzZhNC45MyA0LjkzIDAgMCAwIC44NS01LjI0bC0uNDMtLjg0QTYuMSA2LjEgMCAwIDAgODQuMDIgNDlINDl2MzUuMDJhOC4wOCA4LjA4IDAgMCAxLTQuMTMgNi42NmwtLjg0LjQzYTYuOTEgNi45MSAwIDAgMS03LjU2LTEuMjJsLTIuMzYtMi4zNkExMC4wNiAxMC4wNiAwIDAgMCAyOCA4NWExMSAxMSAwIDAgMCAwIDIyYzEuOTQgMCA0Ljc1LTEuMTYgNi4xMS0yLjUzbDIuMzYtMi4zNmE2LjkzIDYuOTMgMCAwIDEgNy41Ni0xLjIybC44NC40M2E4LjA4IDguMDggMCAwIDEgNC4xMyA2LjY2VjE0M2gzNS4wMnonPjwvcGF0aD48L3N2Zz4=");
  }
}
.left-scrollbar .el-scrollbar__wrap {
  box-sizing: border-box;
  overflow-x: hidden !important;
  margin-bottom: 0 !important;
}
.center-tabs{
  .el-tabs__header{
    margin-bottom: 0!important;
  }
  .el-tabs__item{
    width: 50%;
    text-align: center;
  }
  .el-tabs__nav{
    width: 100%;
  }
}
.reg-item{
  padding: 12px 6px;
  background: #f8f8f8;
  position: relative;
  border-radius: 4px;
  .close-btn{
    position: absolute;
    right: -6px;
    top: -6px;
    display: block;
    width: 16px;
    height: 16px;
    line-height: 16px;
    background: rgba(0, 0, 0, 0.2);
    border-radius: 50%;
    color: #fff;
    text-align: center;
    z-index: 1;
    cursor: pointer;
    font-size: 12px;
    &:hover{
      background: rgba(210, 23, 23, 0.5)
    }
  }
  & + .reg-item{
    margin-top: 18px;
  }
}
.action-bar{
  & .el-button+.el-button {
    margin-left: 15px;
  }
  & i {
    font-size: 20px;
    vertical-align: middle;
    position: relative;
    top: -1px;
  }
}

.custom-tree-node{
  width: 100%;
  font-size: 14px;
  .node-operation{
    float: right;
  }
  i[class*="el-icon"] + i[class*="el-icon"]{
    margin-left: 6px;
  }
  .el-icon-plus{
    color: #409EFF;
  }
  .el-icon-delete{
    color: #157a0c;
  }
}

.left-scrollbar .el-scrollbar__view{
  overflow-x: hidden;
  background-image: url("data:image/svg+xml;charset=utf-8;base64,PHN2ZyB4bWxucz0naHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmcnIHdpZHRoPScxOTInIGhlaWdodD0nMTkyJyB2aWV3Qm94PScwIDAgMTkyIDE5Mic+PHBhdGggZmlsbD0nIzQ5NDg0OScgZmlsbC1vcGFjaXR5PScwLjA4JyBkPSdNMTkyIDE1djJhMTEgMTEgMCAwIDAtMTEgMTFjMCAxLjk0IDEuMTYgNC43NSAyLjUzIDYuMTFsMi4zNiAyLjM2YTYuOTMgNi45MyAwIDAgMSAxLjIyIDcuNTZsLS40My44NGE4LjA4IDguMDggMCAwIDEtNi42NiA0LjEzSDE0NXYzNS4wMmE2LjEgNi4xIDAgMCAwIDMuMDMgNC44N2wuODQuNDNjMS41OC43OSA0IC40IDUuMjQtLjg1bDIuMzYtMi4zNmExMi4wNCAxMi4wNCAwIDAgMSA3LjUxLTMuMTEgMTMgMTMgMCAxIDEgLjAyIDI2IDEyIDEyIDAgMCAxLTcuNTMtMy4xMWwtMi4zNi0yLjM2YTQuOTMgNC45MyAwIDAgMC01LjI0LS44NWwtLjg0LjQzYTYuMSA2LjEgMCAwIDAtMy4wMyA0Ljg3VjE0M2gzNS4wMmE4LjA4IDguMDggMCAwIDEgNi42NiA0LjEzbC40My44NGE2LjkxIDYuOTEgMCAwIDEtMS4yMiA3LjU2bC0yLjM2IDIuMzZBMTAuMDYgMTAuMDYgMCAwIDAgMTgxIDE2NGExMSAxMSAwIDAgMCAxMSAxMXYyYTEzIDEzIDAgMCAxLTEzLTEzIDEyIDEyIDAgMCAxIDMuMTEtNy41M2wyLjM2LTIuMzZhNC45MyA0LjkzIDAgMCAwIC44NS01LjI0bC0uNDMtLjg0YTYuMSA2LjEgMCAwIDAtNC44Ny0zLjAzSDE0NXYzNS4wMmE4LjA4IDguMDggMCAwIDEtNC4xMyA2LjY2bC0uODQuNDNhNi45MSA2LjkxIDAgMCAxLTcuNTYtMS4yMmwtMi4zNi0yLjM2QTEwLjA2IDEwLjA2IDAgMCAwIDEyNCAxODFhMTEgMTEgMCAwIDAtMTEgMTFoLTJhMTMgMTMgMCAwIDEgMTMtMTNjMi40NyAwIDUuNzkgMS4zNyA3LjUzIDMuMTFsMi4zNiAyLjM2YTQuOTQgNC45NCAwIDAgMCA1LjI0Ljg1bC44NC0uNDNhNi4xIDYuMSAwIDAgMCAzLjAzLTQuODdWMTQ1aC0zNS4wMmE4LjA4IDguMDggMCAwIDEtNi42Ni00LjEzbC0uNDMtLjg0YTYuOTEgNi45MSAwIDAgMSAxLjIyLTcuNTZsMi4zNi0yLjM2QTEwLjA2IDEwLjA2IDAgMCAwIDEwNyAxMjRhMTEgMTEgMCAwIDAtMjIgMGMwIDEuOTQgMS4xNiA0Ljc1IDIuNTMgNi4xMWwyLjM2IDIuMzZhNi45MyA2LjkzIDAgMCAxIDEuMjIgNy41NmwtLjQzLjg0YTguMDggOC4wOCAwIDAgMS02LjY2IDQuMTNINDl2MzUuMDJhNi4xIDYuMSAwIDAgMCAzLjAzIDQuODdsLjg0LjQzYzEuNTguNzkgNCAuNCA1LjI0LS44NWwyLjM2LTIuMzZhMTIuMDQgMTIuMDQgMCAwIDEgNy41MS0zLjExQTEzIDEzIDAgMCAxIDgxIDE5MmgtMmExMSAxMSAwIDAgMC0xMS0xMWMtMS45NCAwLTQuNzUgMS4xNi02LjExIDIuNTNsLTIuMzYgMi4zNmE2LjkzIDYuOTMgMCAwIDEtNy41NiAxLjIybC0uODQtLjQzYTguMDggOC4wOCAwIDAgMS00LjEzLTYuNjZWMTQ1SDExLjk4YTYuMSA2LjEgMCAwIDAtNC44NyAzLjAzbC0uNDMuODRjLS43OSAxLjU4LS40IDQgLjg1IDUuMjRsMi4zNiAyLjM2YTEyLjA0IDEyLjA0IDAgMCAxIDMuMTEgNy41MUExMyAxMyAwIDAgMSAwIDE3N3YtMmExMSAxMSAwIDAgMCAxMS0xMWMwLTEuOTQtMS4xNi00Ljc1LTIuNTMtNi4xMWwtMi4zNi0yLjM2YTYuOTMgNi45MyAwIDAgMS0xLjIyLTcuNTZsLjQzLS44NGE4LjA4IDguMDggMCAwIDEgNi42Ni00LjEzSDQ3di0zNS4wMmE2LjEgNi4xIDAgMCAwLTMuMDMtNC44N2wtLjg0LS40M2MtMS41OS0uOC00LS40LTUuMjQuODVsLTIuMzYgMi4zNkExMiAxMiAwIDAgMSAyOCAxMDlhMTMgMTMgMCAxIDEgMC0yNmMyLjQ3IDAgNS43OSAxLjM3IDcuNTMgMy4xMWwyLjM2IDIuMzZhNC45NCA0Ljk0IDAgMCAwIDUuMjQuODVsLjg0LS40M0E2LjEgNi4xIDAgMCAwIDQ3IDg0LjAyVjQ5SDExLjk4YTguMDggOC4wOCAwIDAgMS02LjY2LTQuMTNsLS40My0uODRhNi45MSA2LjkxIDAgMCAxIDEuMjItNy41NmwyLjM2LTIuMzZBMTAuMDYgMTAuMDYgMCAwIDAgMTEgMjggMTEgMTEgMCAwIDAgMCAxN3YtMmExMyAxMyAwIDAgMSAxMyAxM2MwIDIuNDctMS4zNyA1Ljc5LTMuMTEgNy41M2wtMi4zNiAyLjM2YTQuOTQgNC45NCAwIDAgMC0uODUgNS4yNGwuNDMuODRBNi4xIDYuMSAwIDAgMCAxMS45OCA0N0g0N1YxMS45OGE4LjA4IDguMDggMCAwIDEgNC4xMy02LjY2bC44NC0uNDNhNi45MSA2LjkxIDAgMCAxIDcuNTYgMS4yMmwyLjM2IDIuMzZBMTAuMDYgMTAuMDYgMCAwIDAgNjggMTEgMTEgMTEgMCAwIDAgNzkgMGgyYTEzIDEzIDAgMCAxLTEzIDEzIDEyIDEyIDAgMCAxLTcuNTMtMy4xMWwtMi4zNi0yLjM2YTQuOTMgNC45MyAwIDAgMC01LjI0LS44NWwtLjg0LjQzQTYuMSA2LjEgMCAwIDAgNDkgMTEuOThWNDdoMzUuMDJhOC4wOCA4LjA4IDAgMCAxIDYuNjYgNC4xM2wuNDMuODRhNi45MSA2LjkxIDAgMCAxLTEuMjIgNy41NmwtMi4zNiAyLjM2QTEwLjA2IDEwLjA2IDAgMCAwIDg1IDY4YTExIDExIDAgMCAwIDIyIDBjMC0xLjk0LTEuMTYtNC43NS0yLjUzLTYuMTFsLTIuMzYtMi4zNmE2LjkzIDYuOTMgMCAwIDEtMS4yMi03LjU2bC40My0uODRhOC4wOCA4LjA4IDAgMCAxIDYuNjYtNC4xM0gxNDNWMTEuOThhNi4xIDYuMSAwIDAgMC0zLjAzLTQuODdsLS44NC0uNDNjLTEuNTktLjgtNC0uNC01LjI0Ljg1bC0yLjM2IDIuMzZBMTIgMTIgMCAwIDEgMTI0IDEzYTEzIDEzIDAgMCAxLTEzLTEzaDJhMTEgMTEgMCAwIDAgMTEgMTFjMS45NCAwIDQuNzUtMS4xNiA2LjExLTIuNTNsMi4zNi0yLjM2YTYuOTMgNi45MyAwIDAgMSA3LjU2LTEuMjJsLjg0LjQzYTguMDggOC4wOCAwIDAgMSA0LjEzIDYuNjZWNDdoMzUuMDJhNi4xIDYuMSAwIDAgMCA0Ljg3LTMuMDNsLjQzLS44NGMuOC0xLjU5LjQtNC0uODUtNS4yNGwtMi4zNi0yLjM2QTEyIDEyIDAgMCAxIDE3OSAyOGExMyAxMyAwIDAgMSAxMy0xM3pNODQuMDIgMTQzYTYuMSA2LjEgMCAwIDAgNC44Ny0zLjAzbC40My0uODRjLjgtMS41OS40LTQtLjg1LTUuMjRsLTIuMzYtMi4zNkExMiAxMiAwIDAgMSA4MyAxMjRhMTMgMTMgMCAxIDEgMjYgMGMwIDIuNDctMS4zNyA1Ljc5LTMuMTEgNy41M2wtMi4zNiAyLjM2YTQuOTQgNC45NCAwIDAgMC0uODUgNS4yNGwuNDMuODRhNi4xIDYuMSAwIDAgMCA0Ljg3IDMuMDNIMTQzdi0zNS4wMmE4LjA4IDguMDggMCAwIDEgNC4xMy02LjY2bC44NC0uNDNhNi45MSA2LjkxIDAgMCAxIDcuNTYgMS4yMmwyLjM2IDIuMzZBMTAuMDYgMTAuMDYgMCAwIDAgMTY0IDEwN2ExMSAxMSAwIDAgMCAwLTIyYy0xLjk0IDAtNC43NSAxLjE2LTYuMTEgMi41M2wtMi4zNiAyLjM2YTYuOTMgNi45MyAwIDAgMS03LjU2IDEuMjJsLS44NC0uNDNhOC4wOCA4LjA4IDAgMCAxLTQuMTMtNi42NlY0OWgtMzUuMDJhNi4xIDYuMSAwIDAgMC00Ljg3IDMuMDNsLS40My44NGMtLjc5IDEuNTgtLjQgNCAuODUgNS4yNGwyLjM2IDIuMzZhMTIuMDQgMTIuMDQgMCAwIDEgMy4xMSA3LjUxQTEzIDEzIDAgMSAxIDgzIDY4YTEyIDEyIDAgMCAxIDMuMTEtNy41M2wyLjM2LTIuMzZhNC45MyA0LjkzIDAgMCAwIC44NS01LjI0bC0uNDMtLjg0QTYuMSA2LjEgMCAwIDAgODQuMDIgNDlINDl2MzUuMDJhOC4wOCA4LjA4IDAgMCAxLTQuMTMgNi42NmwtLjg0LjQzYTYuOTEgNi45MSAwIDAgMS03LjU2LTEuMjJsLTIuMzYtMi4zNkExMC4wNiAxMC4wNiAwIDAgMCAyOCA4NWExMSAxMSAwIDAgMCAwIDIyYzEuOTQgMCA0Ljc1LTEuMTYgNi4xMS0yLjUzbDIuMzYtMi4zNmE2LjkzIDYuOTMgMCAwIDEgNy41Ni0xLjIybC44NC40M2E4LjA4IDguMDggMCAwIDEgNC4xMyA2LjY2VjE0M2gzNS4wMnonPjwvcGF0aD48L3N2Zz4=");
}

.el-rate{
  display: inline-block;
  vertical-align: text-top;
}
.el-upload__tip{
  line-height: 1.2;
}

$selectedColor: #f6f7ff;
$lighterBlue: #409EFF;

.container {
  position: relative;
  width: 100%;
  height: 100%;
}

.components-list {
  padding: 8px;
  box-sizing: border-box;
  height: 100%;
  .components-item {
    display: inline-block;
    width: 48%;
    margin: 1%;
    transition: transform 0ms !important;
  }
}
.components-draggable{
  padding-bottom: 20px;
}
.components-title{
  font-size: 14px;
  color: #222;
  margin: 6px 2px;
  .svg-icon{
    color: #666;
    font-size: 18px;
  }
}

.components-body {
  padding: 8px 10px;
  background: $selectedColor;
  font-size: 12px;
  cursor: move;
  border: 1px dashed $selectedColor;
  border-radius: 3px;
  .svg-icon{
    color: #777;
    font-size: 15px;
  }
  &:hover {
    border: 1px dashed #787be8;
    color: #787be8;
    .svg-icon {
      color: #787be8;
    }
  }
}

.left-board {
  width: 260px;
  position: absolute;
  left: 0;
  top: 0;
  height: 100vh;
}
.left-scrollbar{
  height: calc(100vh - 42px);
  overflow: hidden;
}
.center-scrollbar {
  height: calc(100vh - 42px);
  overflow: hidden;
  border-left: 1px solid #f1e8e8;
  border-right: 1px solid #f1e8e8;
  box-sizing: border-box;
}
.center-board {
  height: 100vh;
  width: auto;
  margin: 0 350px 0 260px;
  box-sizing: border-box;
}
.empty-info{
  position: absolute;
  top: 46%;
  left: 0;
  right: 0;
  text-align: center;
  font-size: 18px;
  color: #ccb1ea;
  letter-spacing: 4px;
}
.action-bar{
  position: relative;
  height: 42px;
  text-align: right;
  padding: 0 15px;
  box-sizing: border-box;;
  border: 1px solid #f1e8e8;
  border-top: none;
  border-left: none;
  .delete-btn{
    color: #F56C6C;
  }
}
.logo-wrapper{
  position: relative;
  height: 42px;
  background: #fff;
  border-bottom: 1px solid #f1e8e8;
  box-sizing: border-box;
}
.logo{
  position: absolute;
  left: 12px;
  top: 6px;
  line-height: 30px;
  color: #00afff;
  font-weight: 600;
  font-size: 17px;
  white-space: nowrap;
  > img{
    width: 30px;
    height: 30px;
    vertical-align: top;
  }
  .github{
    display: inline-block;
    vertical-align: sub;
    margin-left: 15px;
    > img{
      height: 22px;
    }
  }
}

.center-board-row {
  padding: 12px 12px 15px 12px;
  box-sizing: border-box;
  & > .el-form {
    // 69 = 12+15+42
    height: calc(100vh - 69px);
  }
}
.drawing-board {
  height: 100%;
  position: relative;
  .components-body {
    padding: 0;
    margin: 0;
    font-size: 0;
  }
  .sortable-ghost {
    position: relative;
    display: block;
    overflow: hidden;
    &::before {
      content: " ";
      position: absolute;
      left: 0;
      right: 0;
      top: 0;
      height: 3px;
      background: rgb(89, 89, 223);
      z-index: 2;
    }
  }
  .components-item.sortable-ghost {
    width: 100%;
    height: 60px;
    background-color: $selectedColor;
  }
  .active-from-item {
    & > .el-form-item{
      background: $selectedColor;
      border-radius: 6px;
    }
    & > .drawing-item-copy, & > .drawing-item-delete{
      display: initial;
    }
    & > .component-name{
      color: $lighterBlue;
    }
  }
  .el-form-item{
    margin-bottom: 15px;
  }
}
.drawing-item{
  position: relative;
  cursor: move;
  &.unfocus-bordered:not(.activeFromItem) > div:first-child  {
    border: 1px dashed #ccc;
  }
  .el-form-item{
    padding: 12px 10px;
  }
}
.drawing-row-item{
  position: relative;
  cursor: move;
  box-sizing: border-box;
  border: 1px dashed #ccc;
  border-radius: 3px;
  padding: 0 2px;
  margin-bottom: 15px;
  .drawing-row-item {
    margin-bottom: 2px;
  }
  .el-col{
    margin-top: 22px;
  }
  .el-form-item{
    margin-bottom: 0;
  }
  .drag-wrapper{
    min-height: 80px;
  }
  &.active-from-item{
    border: 1px dashed $lighterBlue;
  }
  .component-name{
    position: absolute;
    top: 0;
    left: 0;
    font-size: 12px;
    color: #bbb;
    display: inline-block;
    padding: 0 6px;
  }
}
.drawing-item, .drawing-row-item{
  &:hover {
    & > .el-form-item{
      background: $selectedColor;
      border-radius: 6px;
    }
    & > .drawing-item-copy, & > .drawing-item-delete{
      display: initial;
    }
  }
  & > .drawing-item-copy, & > .drawing-item-delete{
    display: none;
    position: absolute;
    top: -10px;
    width: 22px;
    height: 22px;
    line-height: 22px;
    text-align: center;
    border-radius: 50%;
    font-size: 12px;
    border: 1px solid;
    cursor: pointer;
    z-index: 1;
  }
  & > .drawing-item-copy{
    right: 56px;
    border-color: $lighterBlue;
    color: $lighterBlue;
    background: #fff;
    &:hover{
      background: $lighterBlue;
      color: #fff;
    }
  }
  & > .drawing-item-delete{
    right: 24px;
    border-color: #F56C6C;
    color: #F56C6C;
    background: #fff;
    &:hover{
      background: #F56C6C;
      color: #fff;
    }
  }
}
</style>
