<script setup lang="ts">
const { create } = useStrapi();

useSeo({
  title: '联系我们',
  description: '联系薪汇科技 - 我们期待与您的合作',
});

const form = reactive({
  name: '',
  email: '',
  phone: '',
  content: '',
});

const isSubmitting = ref(false);
const submitResult = ref<{ success: boolean; message: string } | null>(null);

async function handleSubmit() {
  if (!form.name || !form.email || !form.content) {
    submitResult.value = { success: false, message: '请填写必填项' };
    return;
  }

  isSubmitting.value = true;
  submitResult.value = null;

  try {
    await create('messages', {
      name: form.name,
      email: form.email,
      phone: form.phone || undefined,
      content: form.content,
    });
    submitResult.value = { success: true, message: '留言已提交，我们会尽快回复！' };
    form.name = '';
    form.email = '';
    form.phone = '';
    form.content = '';
  } catch (err: any) {
    const msg = err?.data?.error?.message || '提交失败，请稍后再试';
    submitResult.value = { success: false, message: msg };
  } finally {
    isSubmitting.value = false;
  }
}
</script>

<template>
  <div>
    <!-- Page Header -->
    <section class="bg-dark py-16 sm:py-20">
      <div class="container-page text-center">
        <h1 class="text-3xl sm:text-4xl font-bold text-white">联系我们</h1>
        <p class="mt-4 text-gray-300">我们期待与您的合作</p>
      </div>
    </section>

    <!-- Contact Form -->
    <section class="py-16">
      <div class="container-page max-w-2xl">
        <form @submit.prevent="handleSubmit" class="space-y-6">
          <!-- Name -->
          <div>
            <label for="name" class="block text-sm font-medium text-gray-700 mb-1">
              姓名 <span class="text-red-500">*</span>
            </label>
            <input
              id="name"
              v-model="form.name"
              type="text"
              required
              maxlength="100"
              class="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition"
              placeholder="请输入您的姓名"
            />
          </div>

          <!-- Email -->
          <div>
            <label for="email" class="block text-sm font-medium text-gray-700 mb-1">
              邮箱 <span class="text-red-500">*</span>
            </label>
            <input
              id="email"
              v-model="form.email"
              type="email"
              required
              class="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition"
              placeholder="请输入您的邮箱"
            />
          </div>

          <!-- Phone -->
          <div>
            <label for="phone" class="block text-sm font-medium text-gray-700 mb-1">
              电话
            </label>
            <input
              id="phone"
              v-model="form.phone"
              type="tel"
              maxlength="20"
              class="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition"
              placeholder="请输入您的电话（选填）"
            />
          </div>

          <!-- Content -->
          <div>
            <label for="content" class="block text-sm font-medium text-gray-700 mb-1">
              留言内容 <span class="text-red-500">*</span>
            </label>
            <textarea
              id="content"
              v-model="form.content"
              required
              rows="5"
              class="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition resize-none"
              placeholder="请输入您的留言内容"
            />
          </div>

          <!-- Result Message -->
          <div
            v-if="submitResult"
            class="p-4 rounded-lg text-sm"
            :class="submitResult.success ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'"
          >
            {{ submitResult.message }}
          </div>

          <!-- Submit -->
          <button
            type="submit"
            :disabled="isSubmitting"
            class="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {{ isSubmitting ? '提交中...' : '提交留言' }}
          </button>
        </form>
      </div>
    </section>
  </div>
</template>
