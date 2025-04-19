<template>
  <UCard class="h-screen sticky top-0 rounded-none shadow-none border-r ring-0">
    <div class="p-4 space-y-4 h-full overflow-y-auto">
      <UNavigationMenu
        orientation="vertical"
        :items="items"
        class="w-48"
      />

      <USelect
        v-model="colorMode.preference"
        :items="colorModeOptions"
        :icon="selectedIcon"
        class="w-full"
        color="gray"
        variant="subtle"
      />
    </div>
  </UCard>
</template>

<script setup lang="ts">
  const items = ref([
    [
      {
        label: 'Home',
        icon: 'i-lucide-home',
        to: '/',
      },
      {
        label: 'Chat AI',
        icon: 'i-lucide-message-square',
        to: '/chat',
        description: 'Interact with my AI assistant',
      },
      {
        label: 'About Me',
        icon: 'i-lucide-user',
        to: '/about',
        description: 'Learn more about my background',
      },
      {
        label: 'Projects',
        icon: 'i-lucide-folder-git-2',
        children: [
          {
            label: 'Featured',
            description: 'My most notable projects',
            icon: 'i-lucide-star',
            to: '/projects/featured',
          },
          {
            label: 'All Projects',
            description: 'Complete project portfolio',
            icon: 'i-lucide-folder-open',
            to: '/projects',
          },
        ],
      },
      {
        label: 'Skills',
        icon: 'i-lucide-code',
        to: '/skills',
        description: 'Technical expertise and tools',
      },
      {
        label: 'Experience',
        icon: 'i-lucide-briefcase',
        to: '/experience',
        description: 'Professional journey',
      },
      {
        label: 'Resume',
        icon: 'i-lucide-file-text',
        to: '/resume',
        description: 'Download my resume',
      },
      {
        label: 'Blog',
        icon: 'i-lucide-pen-tool',
        to: '/blog',
        description: 'Technical articles and insights',
      },
    ],
    [
      {
        label: 'Contact',
        icon: 'i-lucide-mail',
        to: '/contact',
        description: 'Get in touch',
      },
      {
        label: 'GitHub',
        icon: 'i-simple-icons-github',
        to: 'https://github.com/yourusername',
        target: '_blank',
        description: 'View my code',
      },
      {
        label: 'LinkedIn',
        icon: 'i-simple-icons-linkedin',
        to: 'https://linkedin.com/in/yourusername',
        target: '_blank',
        description: 'Professional profile',
      },
    ],
  ]);

  const colorMode = useColorMode();

  type ColorMode = 'system' | 'light' | 'dark';
  const colorModeConfig: Record<ColorMode, { label: string; icon: string }> = {
    system: { label: 'System', icon: 'i-lucide-monitor' },
    light: { label: 'Light', icon: 'i-lucide-sun' },
    dark: { label: 'Dark', icon: 'i-lucide-moon' },
  };

  const colorModeOptions = computed(() =>
    Object.entries(colorModeConfig).map(([value, { label, icon }]) => ({
      label,
      value,
      icon,
    }))
  );

  const selectedIcon = computed(
    () => colorModeConfig[colorMode.preference as ColorMode].icon
  );
</script>
