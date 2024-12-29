<template>
  <Card>
    <ProjectPageDescription :description="project.body" />
  </Card>
</template>

<script setup>
import { Card, ProjectPageDescription } from '@modrinth/ui'

defineProps({
  project: {
    type: Object,
    default: () => {},
  },
})
</script>

<script>
export default {
  name: '介绍',
}
</script>
