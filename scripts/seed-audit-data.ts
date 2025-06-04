// src/scripts/seed-audit-data.ts
// Script to seed audit categories and checks in the database

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding audit categories and checks...');

  // Create audit categories
  const categories = [
    {
      name: 'SEO',
      description: 'Search Engine Optimization checks',
    },
    {
      name: 'Performance',
      description: 'Website performance and speed checks',
    },
    {
      name: 'Accessibility',
      description: 'Web accessibility compliance checks',
    },
    {
      name: 'Best Practices',
      description: 'Web development best practices',
    },
    {
      name: 'Mobile',
      description: 'Mobile-friendly design checks',
    },
    {
      name: 'Security',
      description: 'Website security checks',
    },
  ];

  // Create each category
  for (const category of categories) {
    const existingCategory = await prisma.auditCategory.findFirst({
      where: { name: category.name },
    });

    if (!existingCategory) {
      await prisma.auditCategory.create({
        data: category,
      });
      console.log(`✅ Created category: ${category.name}`);
    } else {
      console.log(`⏭️ Category already exists: ${category.name}`);
    }
  }

  // Get created categories for reference
  const createdCategories = await prisma.auditCategory.findMany();
  const categoryMap = createdCategories.reduce((map: Record<string, string>, category: { name: string, id: string }) => {
    // Convert category name to a key format (lowercase, spaces to underscores)
    map[category.name.toLowerCase().replace(/ /g, '_')] = category.id;
    return map;
  }, {} as Record<string, string>);

  // Define checks for each category
  const checks = [
    // SEO Checks
    {
      name: 'Page Title',
      description: 'Checks if the page has a title tag',
      categoryId: categoryMap['seo'],
      weight: 10,
    },
    {
      name: 'Meta Description',
      description: 'Checks if the page has a meta description',
      categoryId: categoryMap['seo'],
      weight: 8,
    },
    {
      name: 'Heading Structure',
      description: 'Checks if the page has a proper heading structure',
      categoryId: categoryMap['seo'],
      weight: 7,
    },
    {
      name: 'Image Alt Text',
      description: 'Checks if images have alt text',
      categoryId: categoryMap['seo'],
      weight: 6,
    },
    {
      name: 'URL Structure',
      description: 'Checks if URLs are SEO-friendly',
      categoryId: categoryMap['seo'],
      weight: 5,
    },
    {
      name: 'Canonical URLs',
      description: 'Checks if canonical URLs are properly set',
      categoryId: categoryMap['seo'],
      weight: 4,
    },
    {
      name: 'Robots.txt',
      description: 'Checks if robots.txt file exists and is properly configured',
      categoryId: categoryMap['seo'],
      weight: 3,
    },
    {
      name: 'Sitemap',
      description: 'Checks if sitemap.xml exists and is properly configured',
      categoryId: categoryMap['seo'],
      weight: 3,
    },
    
    // Performance Checks
    {
      name: 'Page Load Time',
      description: 'Measures the page load time',
      categoryId: categoryMap['performance'],
      weight: 10,
    },
    {
      name: 'Image Optimization',
      description: 'Checks if images are optimized for web',
      categoryId: categoryMap['performance'],
      weight: 8,
    },
    {
      name: 'Minification',
      description: 'Checks if CSS and JavaScript files are minified',
      categoryId: categoryMap['performance'],
      weight: 7,
    },
    {
      name: 'Compression',
      description: 'Checks if compression is enabled',
      categoryId: categoryMap['performance'],
      weight: 6,
    },
    {
      name: 'Browser Caching',
      description: 'Checks if browser caching is properly configured',
      categoryId: categoryMap['performance'],
      weight: 5,
    },
    {
      name: 'Render-Blocking Resources',
      description: 'Identifies render-blocking resources',
      categoryId: categoryMap['performance'],
      weight: 5,
    },
    
    // Accessibility Checks
    {
      name: 'Color Contrast',
      description: 'Checks if color contrast meets WCAG standards',
      categoryId: categoryMap['accessibility'],
      weight: 8,
    },
    {
      name: 'Keyboard Navigation',
      description: 'Checks if the site is navigable via keyboard',
      categoryId: categoryMap['accessibility'],
      weight: 7,
    },
    {
      name: 'ARIA Attributes',
      description: 'Checks if ARIA attributes are properly used',
      categoryId: categoryMap['accessibility'],
      weight: 6,
    },
    {
      name: 'Form Labels',
      description: 'Checks if form elements have proper labels',
      categoryId: categoryMap['accessibility'],
      weight: 6,
    },
    {
      name: 'Alt Text',
      description: 'Checks if images have alt text for screen readers',
      categoryId: categoryMap['accessibility'],
      weight: 7,
    },
    
    // Best Practices Checks
    {
      name: 'Doctype',
      description: 'Checks if the page has a valid doctype',
      categoryId: categoryMap['best_practices'],
      weight: 3,
    },
    {
      name: 'Character Encoding',
      description: 'Checks if character encoding is specified',
      categoryId: categoryMap['best_practices'],
      weight: 3,
    },
    {
      name: 'JavaScript Errors',
      description: 'Checks for JavaScript errors',
      categoryId: categoryMap['best_practices'],
      weight: 7,
    },
    {
      name: 'Deprecated HTML',
      description: 'Checks for deprecated HTML elements',
      categoryId: categoryMap['best_practices'],
      weight: 5,
    },
    {
      name: 'Console Errors',
      description: 'Checks for console errors',
      categoryId: categoryMap['best_practices'],
      weight: 6,
    },
    
    // Mobile Checks
    {
      name: 'Viewport',
      description: 'Checks if viewport meta tag is properly set',
      categoryId: categoryMap['mobile'],
      weight: 10,
    },
    {
      name: 'Touch Targets',
      description: 'Checks if touch targets are appropriately sized',
      categoryId: categoryMap['mobile'],
      weight: 7,
    },
    {
      name: 'Font Size',
      description: 'Checks if font sizes are readable on mobile',
      categoryId: categoryMap['mobile'],
      weight: 6,
    },
    {
      name: 'Responsive Design',
      description: 'Checks if the site uses responsive design',
      categoryId: categoryMap['mobile'],
      weight: 9,
    },
    
    // Security Checks
    {
      name: 'HTTPS',
      description: 'Checks if the site uses HTTPS',
      categoryId: categoryMap['security'],
      weight: 10,
    },
    {
      name: 'Mixed Content',
      description: 'Checks for mixed content issues',
      categoryId: categoryMap['security'],
      weight: 8,
    },
    {
      name: 'Content Security Policy',
      description: 'Checks if Content Security Policy is implemented',
      categoryId: categoryMap['security'],
      weight: 7,
    },
    {
      name: 'X-Content-Type-Options',
      description: 'Checks if X-Content-Type-Options header is set',
      categoryId: categoryMap['security'],
      weight: 5,
    },
    {
      name: 'X-Frame-Options',
      description: 'Checks if X-Frame-Options header is set',
      categoryId: categoryMap['security'],
      weight: 5,
    },
  ];

  // Create each check
  for (const check of checks) {
    const existingCheck = await prisma.auditCheck.findFirst({
      where: { 
        categoryId: check.categoryId,
        name: check.name 
      },
    });

    if (!existingCheck) {
      await prisma.auditCheck.create({
        data: check,
      });
      console.log(`✅ Created check: ${check.name}`);
    } else {
      console.log(`⏭️ Check already exists: ${check.name}`);
    }
  }

  console.log('✅ Seeding completed!');
}

main()
  .catch((e) => {
    console.error('Error seeding data:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
