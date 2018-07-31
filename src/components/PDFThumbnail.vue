<template>
  <div
    @click="focusPage"
    :class="{ focused: isPageFocused }"
    class="pdf-thumbnail"
    >
    <img
      v-if="src"
      :src="src"
      class="box-shadow"
      />
    <div
      v-else
      class="placeholder box-shadow"
      >
      <div class="content">
        Loading
      </div>
    </div>
    <span class="page-number">{{ pageNumber }}</span>
  </div>
</template>

<script>
import debug from 'debug';
const log = debug('app:components/PDFThumbnail');

export default {
  name: 'PDFThumbnail',

  props: {
    page: {
      type: Object, // instance of PDFPageProxy returned from pdf.getPage
      required: true,
    },
    scale: {
      required: true,
    },
    isPageFocused: {
      type: Boolean,
      default: false,
    },
    isElementVisible: {
      type: Boolean,
      default: false,
    },
  },

  data() {
    return {
        src: undefined
    };
  },

  computed: {
    viewport() {
      return this.page.getViewport(1.0);
    },

    pageNumber() {
      return this.page.pageNumber;
    },
  },

  methods: {
    focusPage() {
      this.$emit('page-focus', this.pageNumber);
    },

    drawPage() {
      // if (this.renderTask) return;
      if (this.page) {
          this.src = this.page.page.src.replace('/1500/2121', '/150/212');
          this.$emit('thumbnail-rendered', {
              page: this.page,
              text: `Rendered thumbnail ${this.pageNumber}`,
          });
      }
    },

    // destroyPage(_newPage, page) {
    //   // PDFPageProxy#_destroy
    //   // https://mozilla.github.io/pdf.js/api/draft/PDFPageProxy.html
    //   // if (page) page._destroy();
    //
    //   this.destroyRenderTask();
    // },
    //
    // destroyRenderTask() {
    //   if (!this.renderTask) return;
    //
    //   // RenderTask#cancel
    //   // https://mozilla.github.io/pdf.js/api/draft/RenderTask.html
    //   // this.renderTask.cancel();
    //   delete this.renderTask;
    // },

    updateVisibility() {
      this.$parent.$emit('update-visibility');
    },
  },

  watch: {
    // page: 'destroyPage',
    src: 'updateVisibility',
    scale: 'updateVisibility',

    isElementVisible(isElementVisible) {
      if (isElementVisible && !this.src) this.drawPage();
    },
  },

  mounted() {
    log(`Page ${this.pageNumber} mounted`);
  },

  // beforeDestroy() {
  //   this.destroyPage(undefined, this.page);
  // },
}
</script>

<style scoped>
.pdf-thumbnail {
  cursor: pointer;
  margin: 0 auto;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  position: relative;
  width: 100%;
}

img,
.placeholder {
  border: 7px solid transparent;
  border-radius: 5px;
  width: 65%;
}

.pdf-thumbnail.focused img {
  border-color: rgba(68, 204, 139, 0.65);
}

.placeholder {
  background: white;
  background-clip: content-box;
  position: relative;
}

.placeholder:before {
  content: '';
  display: block;
  padding-top: 75%;
}

.placeholder .content {
  display: flex;
  justify-content: center;
  align-items: center;
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
}

.page-number {
  color: white;
  font-weight: bold;
}
</style>
