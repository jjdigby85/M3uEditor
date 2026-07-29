<template>
  <div class="global-search-container">
    <header class="page-header">
      <h1>All Playlists & Global Search</h1>
      <p>Search for channels, movies, and series across all your playlists.</p>
    </header>

    <!-- Search Controls -->
    <div class="search-bar-wrapper">
      <input 
        v-model="searchQuery" 
        @input="onSearchInput"
        type="text" 
        placeholder="Search channels, movies, series across all playlists..."
        class="search-input"
      />
      <select v-model="selectedType" @change="fetchResults" class="filter-select">
        <option value="">All Types</option>
        <option value="live">Live TV</option>
        <option value="movie">Movies (VOD)</option>
        <option value="series">Series</option>
      </select>
    </div>

    <!-- Results Table / Cards -->
    <div v-if="loading" class="loading-spinner">Searching...</div>

    <div v-else-if="results.length > 0" class="results-grid">
      <div v-for="item in results" :key="item.channel_id" class="channel-card">
        <img :src="item.logo_url || '/placeholder-logo.png'" alt="logo" class="channel-logo" />
        <div class="channel-info">
          <h3>{{ item.channel_name }}</h3>
          <span class="badge category">{{ item.category_name }}</span>
          <span class="badge type">{{ item.stream_type }}</span>
          <router-link :to="`/editor/${item.playlist_id}`" class="playlist-link">
            📁 {{ item.playlist_name }}
          </router-link>
        </div>
      </div>
    </div>

    <div v-else-if="searchQuery" class="empty-state">
      No channels found matching "{{ searchQuery }}"
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import api from '../api.js'

const searchQuery = ref('')
const selectedType = ref('')
const results = ref([])
const loading = ref(false)
let debounceTimeout = null

const fetchResults = async () => {
  if (!searchQuery.value.trim()) {
    results.value = []
    return
  }
  loading.value = true
  try {
    const res = await api.get('/playlists/global-search', {
      params: { q: searchQuery.value, type: selectedType.value }
    })
    results.value = res.data?.data || []
  } catch (err) {
    console.error('Global search error:', err)
  } finally {
    loading.value = false
  }
}

const onSearchInput = () => {
  clearTimeout(debounceTimeout)
  debounceTimeout = setTimeout(fetchResults, 300)
}
</script>

<style scoped>
.search-bar-wrapper {
  display: flex;
  gap: 12px;
  margin-bottom: 24px;
}
.search-input {
  flex: 1;
  padding: 12px 16px;
  border-radius: 8px;
  font-size: 1rem;
}
.results-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 16px;
}
.channel-card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  border-radius: 8px;
  background: var(--bg-surface);
}
.channel-logo {
  width: 48px;
  height: 48px;
  object-fit: contain;
}
</style>
