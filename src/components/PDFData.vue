<script>
/* eslint-disable */
// PDFDocument renders an entire PDF inline using
// PDF.js and <canvas>. Currently does not support,
// rendering of selected pages (but could be easily
// updated to do so).
import debug from 'debug';
const log = debug('app:components/PDFData');

import range from 'lodash/range';
import PageViewport from '../utils/viewport';
//
// function getDocument(url) {
//   // Using import statement in this way allows Webpack
//   // to treat pdf.js as an async dependency so we can
//   // avoid adding it to one of the main bundles
//   return import(
//     /* webpackChunkName: 'pdfjs-dist' */
//     'pdfjs-dist/webpack').then(pdfjs => pdfjs.getDocument(url));
// }

// pdf: instance of PDFData
// see docs for PDF.js for more info
// function getPages(pdf, first, last) {
//   const allPages = range(first, last+1).map(number => pdf.getPage(number));
//   return Promise.all(allPages);
// }

function getImages(imagesArray, first, last) {
    const allPages = range(first, last).map(number => getImage(imagesArray[number]));
    // const allPages = imagesArray.map(i => getImage(i));
    return Promise.all(allPages);
}

const getImage = function(url) {
    return new Promise(function(resolve, reject) {
        const image = new Image();
        image.addEventListener('load', function() {
            console.log('onload', image);
            resolve(image);
        }, false);
        image.src = url;
    });
};

const BUFFER_LENGTH = 10;
function getDefaults() {
  return {
    pages: [],
    cursor: 0,
  };
}

export default {
  name: 'PDFData',

  props: {
    pagesArray: {
      type: Array,
      required: true,
    },
  },

  data() {
    return Object.assign(getDefaults(), {});
  },

  watch: {
      pagesArray(val, oldVal) {
          if (!val) return;
          if (oldVal) Object.assign(this, getDefaults());
          this.$emit('page-count', this.pageCount);
          this.fetchPages();
      },
      pageCount(val) {
          this.$emit('page-count', val);
      }
  },

  computed: {
    pageCount() {
      return this.pagesArray && this.pagesArray.length > 0 ? this.pagesArray.length : 0;
    },
  },

  methods: {
    fetchPages(currentPage = 0) {
      if (!(this.pagesArray && this.pagesArray.length)) return;
      if (this.pageCount > 0 && this.pages.length === this.pageCount) return;

      const startIndex = this.pages.length;
      if (this.cursor > startIndex) return;

      const startPage = startIndex + 1;
      const endPage = Math.min(Math.max(currentPage, startIndex + BUFFER_LENGTH), this.pageCount);
      this.cursor = endPage;

      log(`Fetching pages ${startPage} to ${endPage}`);
      getImages(this.pagesArray, startPage, endPage)
        .then((pages) => {
          const deleteCount = 0;
          const mappedPages = pages.map((img, index) => {
              return {
                  pageNumber: index,
                  page: img,
                  getViewport() {
                      return new PageViewport({
                          viewBox: [0, 0, img.width, img.height],
                          scale: 1
                      })
                  },
                  render(renderContext) {
                      return new Promise((resolve, reject) => {
                          try {
                              renderContext.canvasContext.drawImage(img, 0, 0, img.width, img.height);
                              resolve();
                          } catch (e) {
                              reject(e);
                          }
                      });
                  }
              }
          });

          this.pages.splice(startIndex, deleteCount, ...mappedPages);
          return this.pages;
        })
        .catch((response) => {
          this.$emit('document-errored', {text: 'Failed to retrieve pages', response});
          log('Failed to retrieve pages', response);
        });
    },

    onPageRendered({text, page}) {
      log(text, page);
    },

    onPageErrored({text, response, page}) {
      log('Error!', text, response, page);
    },
  },

  created() {
    this.$on('page-rendered', this.onPageRendered);
    this.$on('page-errored', this.onPageErrored);
    this.$on('pages-fetch', this.fetchPages);
  },
  render(h) {
    return h('div', [
      this.$scopedSlots.preview({
        pages: this.pages,
      }),
      this.$scopedSlots.document({
        pages: this.pages,
      }),
    ]);
  },
};
</script>
