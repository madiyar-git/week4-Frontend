<template>
  <div class="not-found-container">
    <h1>Page not found: 404</h1>
    <p>This page dosn`t exist</p>
    <RouterLink to="/" class="back-home-btn">Back to tasks</RouterLink>
  </div>
</template>

<style scoped>
.not-found-container {
  text-align: center;
  padding: 60px 20px;
}
h1 {
  color: #ff4d4f;
  font-size: 2rem;
  margin-bottom: 16px;
}
p {
  color: #b3b3b3;
  margin-bottom: 24px;
}
.back-home-btn {
  display: inline-block;
  background-color: #1db954;
  color: #000000;
  text-decoration: none;
  font-weight: bold;
  padding: 12px 24px;
  border-radius: 20px;
  transition: transform 0.2s;
}
.back-home-btn:hover {
  transform: scale(1.05);
}
</style>