// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';

// https://astro.build/config
export default defineConfig({
	// Keep the existing Node player assets separate from the static website.
	publicDir: './site-public',
	integrations: [
		starlight({
			title: 'Creating Coding Careers - Open Source Curriculum',
			customCss: ['./src/styles/custom.css'],
			social: [
				{ icon: 'github', label: 'GitHub', href: 'https://github.com/cccareers/open-source-curriculum' },
			],
			sidebar: [
				// Courses and guides will be added here as content is developed
			],
		}),
	],
});
