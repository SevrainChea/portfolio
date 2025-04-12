<template>
  <div class="space-y-12">
    <!-- Hero Section -->
    <section class="text-center space-y-6">
      <div class="flex justify-center">
        <NuxtImg
          src="/images/profile.jpeg"
          alt="Sevrain Chea"
          class="w-40 h-40 rounded-full object-cover border-4 border-primary-200 dark:border-primary-800 shadow-lg"
        />
      </div>
      <div class="space-y-4">
        <h1 class="text-4xl md:text-5xl font-bold">
          Hi, I'm <span class="text-primary-500">Sevrain</span>
        </h1>
        <p class="text-xl text-primary">
          Tech Lead | Full-Stack Developer | Technology Enthusiast
        </p>
        <p class="max-w-2xl mx-auto text-primary">
          I lead technology teams at startups, building scalable solutions while
          constantly exploring and adopting new technologies to drive
          innovation.
        </p>
      </div>
    </section>

    <!-- AI Chat Showcase -->
    <UCard class="hover:shadow-lg transition-shadow">
      <template #header>
        <div class="flex items-center gap-4">
          <UIcon
            name="i-lucide-bot"
            class="text-4xl text-primary-500"
          />
          <div>
            <h2 class="text-2xl font-bold">Chat with My AI Assistant</h2>
            <p class="text-primary">Experience the power of AI in action</p>
          </div>
        </div>
      </template>

      <div class="grid md:grid-cols-3 gap-6">
        <div class="space-y-2">
          <UIcon
            name="i-lucide-cpu"
            class="text-primary-500"
          />
          <h3 class="font-semibold">Advanced AI</h3>
          <p class="text-sm text-primary">
            Powered by cutting-edge language models and custom tools
          </p>
        </div>
        <div class="space-y-2">
          <UIcon
            name="i-lucide-code"
            class="text-primary-500"
          />
          <h3 class="font-semibold">Technical Expertise</h3>
          <p class="text-sm text-primary">
            Get insights on software development and architecture
          </p>
        </div>
        <div class="space-y-2">
          <UIcon
            name="i-lucide-lightbulb"
            class="text-primary-500"
          />
          <h3 class="font-semibold">Innovation</h3>
          <p class="text-sm text-primary">
            Explore the latest in AI and technology trends
          </p>
        </div>
      </div>

      <template #footer>
        <div class="flex justify-center">
          <UButton
            to="/chat"
            color="primary"
            variant="solid"
            size="lg"
            class="group"
          >
            <span class="flex items-center gap-2">
              Try the AI Chat
              <UIcon
                name="i-lucide-arrow-right"
                class="group-hover:translate-x-1 transition-transform"
              />
            </span>
          </UButton>
        </div>
      </template>
    </UCard>

    <!-- Key Highlights -->
    <section class="grid md:grid-cols-3 gap-6">
      <UCard class="hover:shadow-lg transition-shadow">
        <template #header>
          <div class="flex items-center gap-2">
            <UIcon
              name="i-lucide-code"
              class="text-primary-500"
            />
            <h3 class="font-semibold">Tech Leadership</h3>
          </div>
        </template>
        <p class="text-primary">
          Leading development teams, setting technical direction, and fostering
          a culture of continuous learning and innovation.
        </p>
      </UCard>

      <UCard class="hover:shadow-lg transition-shadow">
        <template #header>
          <div class="flex items-center gap-2">
            <UIcon
              name="i-lucide-rocket"
              class="text-primary-500"
            />
            <h3 class="font-semibold">Startup Experience</h3>
          </div>
        </template>
        <p class="text-primary">
          Building and scaling products in fast-paced startup environments,
          focusing on both technical excellence and business impact.
        </p>
      </UCard>

      <UCard class="hover:shadow-lg transition-shadow">
        <template #header>
          <div class="flex items-center gap-2">
            <UIcon
              name="i-lucide-book-open"
              class="text-primary-500"
            />
            <h3 class="font-semibold">Continuous Learning</h3>
          </div>
        </template>
        <p class="text-primary">
          Passionate about exploring new technologies and sharing knowledge
          through development and technical writing.
        </p>
      </UCard>
    </section>

    <!-- Call to Action -->
    <section class="text-center space-y-4">
      <p class="text-primary">
        Want to learn more about my work or discuss potential opportunities?
      </p>
      <div class="flex justify-center gap-4">
        <UButton
          to="/projects"
          color="primary"
          variant="solid"
        >
          View My Projects
        </UButton>
        <UButton
          to="/contact"
          variant="outline"
        >
          Get in Touch
        </UButton>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
  useHead({
    title: 'Home | Sevrain Chea - Tech Lead & Developer',
    meta: [
      {
        name: 'description',
        content:
          'Tech Lead and Full-Stack Developer with a passion for learning new technologies and building innovative solutions.',
      },
    ],
  });
</script>

<style scoped></style>
