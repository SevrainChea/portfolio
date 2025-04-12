<template>
  <div class="min-h-screen flex flex-col">
    <!-- Header (can be used later for navigation or other elements) -->

    <!-- Main content area -->
    <div class="flex-1 flex relative">
      <!-- Sidebar -->
      <aside class="hidden md:block w-64">
        <Sidebar />
      </aside>

      <!-- Main content -->
      <main class="flex-1 overflow-auto">
        <div class="container mx-auto px-4 py-6">
          <slot />
        </div>
      </main>
    </div>
  </div>
</template>

<script setup lang="ts"></script>

<style></style>
