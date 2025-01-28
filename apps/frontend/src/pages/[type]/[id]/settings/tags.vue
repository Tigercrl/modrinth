<template>
  <div>
    <section class="universal-card">
      <div class="label">
        <h3>
          <span class="label__title size-card-header">标签</span>
        </h3>
      </div>
      <p>
        准确的标签可以帮助人们找到您的{{ $formatProjectType(project.project_type) }}。请确保您选择所有符合的标签。
      </p>
      <p v-if="project.versions.length === 0" class="known-errors">
        请先发布一个版本以选择标签！
      </p>
      <template v-else>
        <template v-for="header in Object.keys(categoryLists)" :key="`categories-${header}`">
          <div class="label">
            <h4>
              <span class="label__title">{{ $formatCategoryHeader(header) }}</span>
            </h4>
            <span class="label__description">
              <template v-if="header === 'categories'">
                选择所有反映此{{ $formatProjectType(project.project_type) }}主题或功能的标签。
              </template>
              <template v-else-if="header === 'features'">
                选择此{{ $formatProjectType(project.project_type) }}中使用的所有功能。
              </template>
              <template v-else-if="header === 'resolutions'">
                选择此{{ $formatProjectType(project.project_type) }}中纹理的分辨率。
              </template>
              <template v-else-if="header === 'performance impact'">
                选择此{{ $formatProjectType(project.project_type) }}造成的性能影响。如果此{{ $formatProjectType(project.project_type) }}可配置不同级别的性能影响，则选择多个标签。
              </template>
            </span>
          </div>
          <div class="category-list input-div">
            <Checkbox
              v-for="category in categoryLists[header]"
              :key="`category-${header}-${category.name}`"
              :model-value="selectedTags.includes(category)"
              :description="$formatCategory(category.name)"
              class="category-selector"
              @update:model-value="toggleCategory(category)"
            >
              <div class="category-selector__label">
                <div
                  v-if="header !== 'resolutions' && category.icon"
                  aria-hidden="true"
                  class="icon"
                  v-html="category.icon"
                />
                <span aria-hidden="true"> {{ $formatCategory(category.name) }}</span>
              </div>
            </Checkbox>
          </div>
        </template>
        <div class="label">
          <h4>
            <span class="label__title"><StarIcon/> 展示标签</span>
          </h4>
          <span class="label__description">
            您最多可以选择 3 个最相关的标签来展示。如果您没选够 3 个标签，其他标签可能会被展示。
          </span>
        </div>
        <p v-if="selectedTags.length < 1">
          请选择至少一个标签，以选择展示标签。
        </p>
        <div class="category-list input-div">
          <Checkbox
            v-for="category in selectedTags"
            :key="`featured-category-${category.name}`"
            class="category-selector"
            :model-value="featuredTags.includes(category)"
            :description="$formatCategory(category.name)"
            :disabled="featuredTags.length >= 3 && !featuredTags.includes(category)"
            @update:model-value="toggleFeaturedCategory(category)"
          >
            <div class="category-selector__label">
              <div
                v-if="category.header !== 'resolutions' && category.icon"
                aria-hidden="true"
                class="icon"
                v-html="category.icon"
              />
              <span aria-hidden="true"> {{ $formatCategory(category.name) }}</span>
            </div>
          </Checkbox>
        </div>
      </template>

      <div class="button-group">
        <button
          type="button"
          class="iconified-button brand-button"
          :disabled="!hasChanges"
          @click="saveChanges()"
        >
          <SaveIcon/>
          保存改动
        </button>
      </div>
    </section>
  </div>
</template>

<script>
import Checkbox from "~/components/ui/Checkbox.vue";
import StarIcon from "~/assets/images/utils/star.svg?component";
import SaveIcon from "~/assets/images/utils/save.svg?component";

export default defineNuxtComponent({
  components: {
    Checkbox,
    SaveIcon,
    StarIcon,
  },
  props: {
    project: {
      type: Object,
      default() {
        return {};
      },
    },
    allMembers: {
      type: Array,
      default() {
        return [];
      },
    },
    currentMember: {
      type: Object,
      default() {
        return null;
      },
    },
    patchProject: {
      type: Function,
      default() {
        return () => {
          this.$notify({
            group: "main",
            title: "发生错误",
            text: "资源信息修改函数未定义",
            type: "error",
          });
        };
      },
    },
  },
  data() {
    return {
      selectedTags: this.$sortedCategories().filter(
        (x) =>
          x.project_type === this.project.actualProjectType &&
          (this.project.categories.includes(x.name) ||
            this.project.additional_categories.includes(x.name)),
      ),
      featuredTags: this.$sortedCategories().filter(
        (x) =>
          x.project_type === this.project.actualProjectType &&
          this.project.categories.includes(x.name),
      ),
    };
  },
  computed: {
    categoryLists() {
      const lists = {};
      this.$sortedCategories().forEach((x) => {
        if (x.project_type === this.project.actualProjectType) {
          const header = x.header;
          if (!lists[header]) {
            lists[header] = [];
          }
          lists[header].push(x);
        }
      });
      return lists;
    },
    patchData() {
      const data = {};
      // Promote selected categories to featured if there are less than 3 featured
      const newFeaturedTags = this.featuredTags.slice();
      if (newFeaturedTags.length < 1 && this.selectedTags.length > newFeaturedTags.length) {
        const nonFeaturedCategories = this.selectedTags.filter((x) => !newFeaturedTags.includes(x));

        nonFeaturedCategories
          .slice(0, Math.min(nonFeaturedCategories.length, 3 - newFeaturedTags.length))
          .forEach((x) => newFeaturedTags.push(x));
      }
      // Convert selected and featured categories to backend-usable arrays
      const categories = newFeaturedTags.map((x) => x.name);
      const additionalCategories = this.selectedTags
        .filter((x) => !newFeaturedTags.includes(x))
        .map((x) => x.name);

      if (
        categories.length !== this.project.categories.length ||
        categories.some((value) => !this.project.categories.includes(value))
      ) {
        data.categories = categories;
      }

      if (
        additionalCategories.length !== this.project.additional_categories.length ||
        additionalCategories.some((value) => !this.project.additional_categories.includes(value))
      ) {
        data.additional_categories = additionalCategories;
      }

      return data;
    },
    hasChanges() {
      return Object.keys(this.patchData).length > 0;
    },
  },
  methods: {
    toggleCategory(category) {
      if (this.selectedTags.includes(category)) {
        this.selectedTags = this.selectedTags.filter((x) => x !== category);
        if (this.featuredTags.includes(category)) {
          this.featuredTags = this.featuredTags.filter((x) => x !== category);
        }
      } else {
        this.selectedTags.push(category);
      }
    },
    toggleFeaturedCategory(category) {
      if (this.featuredTags.includes(category)) {
        this.featuredTags = this.featuredTags.filter((x) => x !== category);
      } else {
        this.featuredTags.push(category);
      }
    },
    saveChanges() {
      if (this.hasChanges) {
        this.patchProject(this.patchData);
      }
    },
  },
});
</script>
<style lang="scss" scoped>
.label__title {
  display: flex;
  align-items: center;
  gap: var(--spacing-card-xs);
  margin-top: var(--spacing-card-bg);

  svg {
    vertical-align: top;
  }
}

.button-group {
  justify-content: flex-start;
}

.category-list {
  column-count: 4;
  column-gap: var(--spacing-card-lg);
  margin-bottom: var(--spacing-card-md);

  :deep(.category-selector) {
    margin-bottom: 0.5rem;

    .category-selector__label {
      display: flex;
      align-items: center;

      .icon {
        height: 1rem;

        svg {
          margin-right: 0.25rem;
          width: 1rem;
          height: 1rem;
        }
      }
    }

    span {
      user-select: none;
    }
  }

  @media only screen and (max-width: 1250px) {
    column-count: 3;
  }
  @media only screen and (max-width: 1024px) {
    column-count: 4;
  }
  @media only screen and (max-width: 960px) {
    column-count: 3;
  }
  @media only screen and (max-width: 750px) {
    column-count: 2;
  }
  @media only screen and (max-width: 530px) {
    column-count: 1;
  }
}
</style>
