// src/lib/services/advanced-chatbot-analyzer.ts
// Advanced chatbot integration analyzer service

import puppeteer from 'puppeteer';
import { BaseAnalyzer } from './base-analyzer';
import { ChatbotIntegrationResult } from '../types/advanced-audit';

export class AdvancedChatbotAnalyzer extends BaseAnalyzer {
  async analyze(url: string): Promise<ChatbotIntegrationResult> {
    try {
      // Launch a browser instance
      const browser = await puppeteer.launch({
        headless: 'new',
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
      });
      
      // Create a new page
      const page = await browser.newPage();
      
      // Set viewport to desktop size
      await page.setViewport({ width: 1280, height: 800 });
      
      // Navigate to the URL
      await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });
      
      // Wait a bit more to ensure chatbots have time to load
      await page.waitForTimeout(5000);
      
      // Check for common chatbot elements
      const chatbotData = await page.evaluate(() => {
        // Common chatbot selectors
        const chatbotSelectors = [
          // Generic chat widgets
          '[class*="chat-widget"]',
          '[class*="chatbot"]',
          '[class*="chat-bot"]',
          '[class*="livechat"]',
          '[class*="live-chat"]',
          '[id*="chat-widget"]',
          '[id*="chatbot"]',
          '[id*="chat-bot"]',
          '[id*="livechat"]',
          '[id*="live-chat"]',
          
          // Popular chatbot services
          // Intercom
          '.intercom-launcher',
          '#intercom-container',
          '[class*="intercom"]',
          
          // Drift
          '#drift-widget',
          '.drift-widget-controller',
          '[class*="drift"]',
          
          // Zendesk
          '.zEWidget-launcher',
          '#launcher',
          '[class*="zopim"]',
          '[class*="zendesk"]',
          
          // Crisp
          '.crisp-client',
          '#crisp-chatbox',
          
          // Tawk.to
          '#tawkchat-container',
          '.tawk-min-container',
          
          // Freshchat
          '#freshchat-container',
          '.fc-widget-container',
          
          // HubSpot
          '#hubspot-messages-iframe-container',
          '.hs-chat-widget',
          
          // Olark
          '#olark-container',
          '.olark-launch-button',
          
          // LivePerson
          '#LP_DIV_1',
          '[class*="lp-chat"]',
          
          // Tidio
          '#tidio-chat',
          '.tidio-chat-container',
          
          // Facebook Messenger
          '.fb-customerchat',
          '.fb-messenger-checkbox',
          
          // WhatsApp
          '[class*="whatsapp-chat"]',
          '[class*="whatsapp-widget"]',
          
          // Common chatbot button patterns
          '[class*="chat-button"]',
          '[class*="chat-icon"]',
          '[class*="chat-bubble"]',
          '[class*="chat-toggle"]',
          '[class*="support-button"]',
          '[class*="help-button"]',
          
          // AI chatbot specific
          '[class*="ai-chat"]',
          '[class*="ai-assistant"]',
          '[class*="chatgpt"]',
          '[class*="bot-widget"]',
        ];
        
        // Check for iframe-based chatbots
        const iframes = Array.from(document.querySelectorAll('iframe'));
        const chatIframes = iframes.filter(iframe => {
          const src = iframe.src || '';
          return (
            src.includes('chat') ||
            src.includes('bot') ||
            src.includes('intercom') ||
            src.includes('drift') ||
            src.includes('zendesk') ||
            src.includes('crisp') ||
            src.includes('tawk') ||
            src.includes('freshchat') ||
            src.includes('hubspot') ||
            src.includes('olark') ||
            src.includes('liveperson') ||
            src.includes('tidio') ||
            src.includes('messenger') ||
            src.includes('whatsapp')
          );
        });
        
        // Check for chatbot scripts
        const scripts = Array.from(document.querySelectorAll('script'));
        const chatbotScripts = scripts.filter(script => {
          const src = script.src || '';
          const content = script.textContent || '';
          
          return (
            src.includes('chat') ||
            src.includes('bot') ||
            src.includes('intercom') ||
            src.includes('drift') ||
            src.includes('zendesk') ||
            src.includes('crisp') ||
            src.includes('tawk') ||
            src.includes('freshchat') ||
            src.includes('hubspot') ||
            src.includes('olark') ||
            src.includes('liveperson') ||
            src.includes('tidio') ||
            src.includes('messenger') ||
            src.includes('whatsapp') ||
            content.includes('chatbot') ||
            content.includes('livechat') ||
            content.includes('intercom') ||
            content.includes('drift') ||
            content.includes('zendesk') ||
            content.includes('crisp') ||
            content.includes('tawk') ||
            content.includes('freshchat') ||
            content.includes('hubspot') ||
            content.includes('olark') ||
            content.includes('liveperson') ||
            content.includes('tidio')
          );
        });
        
        // Find chatbot elements
        const chatbotElements: { selector: string; visible: boolean; rect: any }[] = [];
        
        for (const selector of chatbotSelectors) {
          try {
            const elements = document.querySelectorAll(selector);
            
            for (const el of Array.from(elements)) {
              const rect = el.getBoundingClientRect();
              const isVisible = rect.width > 0 && rect.height > 0;
              
              if (isVisible || (rect.width === 0 && rect.height === 0 && window.getComputedStyle(el).display !== 'none')) {
                chatbotElements.push({
                  selector,
                  visible: isVisible,
                  rect: {
                    width: rect.width,
                    height: rect.height,
                    top: rect.top,
                    left: rect.left,
                    bottom: rect.bottom,
                    right: rect.right,
                  },
                });
              }
            }
          } catch (e) {
            // Ignore errors for individual selectors
          }
        }
        
        // Check for common chatbot keywords in the page
        const bodyText = document.body.textContent || '';
        const chatKeywords = [
          'chat with us',
          'live chat',
          'chat now',
          'start chat',
          'chat support',
          'chat with support',
          'chat with an agent',
          'chat with a representative',
          'virtual assistant',
          'ai assistant',
          'chatbot',
          'chat bot',
          'message us',
        ];
        
        const foundKeywords = chatKeywords.filter(keyword => 
          bodyText.toLowerCase().includes(keyword.toLowerCase())
        );
        
        return {
          chatbotElements,
          chatIframes: chatIframes.length,
          chatbotScripts: chatbotScripts.length,
          foundKeywords,
        };
      });
      
      // Determine chatbot type based on the findings
      let chatbotType = 'none';
      let chatbotProvider = 'unknown';
      let chatbotPosition = 'unknown';
      let chatbotVisibility = false;
      
      // Check if any chatbot was detected
      const hasChatbot = (
        chatbotData.chatbotElements.length > 0 ||
        chatbotData.chatIframes > 0 ||
        chatbotData.chatbotScripts > 0
      );
      
      if (hasChatbot) {
        // Determine chatbot provider
        const providerPatterns = [
          { pattern: 'intercom', provider: 'Intercom' },
          { pattern: 'drift', provider: 'Drift' },
          { pattern: 'zendesk', provider: 'Zendesk Chat' },
          { pattern: 'zopim', provider: 'Zendesk Chat (Zopim)' },
          { pattern: 'crisp', provider: 'Crisp' },
          { pattern: 'tawk', provider: 'Tawk.to' },
          { pattern: 'freshchat', provider: 'Freshchat' },
          { pattern: 'hubspot', provider: 'HubSpot Chat' },
          { pattern: 'olark', provider: 'Olark' },
          { pattern: 'liveperson', provider: 'LivePerson' },
          { pattern: 'tidio', provider: 'Tidio' },
          { pattern: 'messenger', provider: 'Facebook Messenger' },
          { pattern: 'whatsapp', provider: 'WhatsApp' },
          { pattern: 'chatgpt', provider: 'ChatGPT/OpenAI' },
          { pattern: 'ai-chat', provider: 'AI Chatbot' },
        ];
        
        // Check elements for provider patterns
        for (const element of chatbotData.chatbotElements) {
          for (const { pattern, provider } of providerPatterns) {
            if (element.selector.toLowerCase().includes(pattern)) {
              chatbotProvider = provider;
              break;
            }
          }
          
          if (chatbotProvider !== 'unknown') break;
        }
        
        // Determine chatbot position based on visible elements
        const visibleElements = chatbotData.chatbotElements.filter(el => el.visible);
        
        if (visibleElements.length > 0) {
          chatbotVisibility = true;
          
          // Find the most prominent chatbot element (usually the largest or most visible)
          const mainElement = visibleElements.reduce((prev, current) => {
            const prevArea = prev.rect.width * prev.rect.height;
            const currentArea = current.rect.width * current.rect.height;
            return currentArea > prevArea ? current : prev;
          }, visibleElements[0]);
          
          // Determine position
          const { left, right, top, bottom } = mainElement.rect;
          const windowWidth = page.viewport()?.width || 1280;
          const windowHeight = page.viewport()?.height || 800;
          
          if (right <= windowWidth * 0.33) {
            chatbotPosition = 'left';
          } else if (left >= windowWidth * 0.67) {
            chatbotPosition = 'right';
          } else {
            chatbotPosition = 'center';
          }
          
          if (bottom <= windowHeight * 0.33) {
            chatbotPosition = `top-${chatbotPosition}`;
          } else if (top >= windowHeight * 0.67) {
            chatbotPosition = `bottom-${chatbotPosition}`;
          }
        }
        
        // Determine chatbot type
        if (chatbotProvider.includes('AI') || chatbotProvider.includes('ChatGPT')) {
          chatbotType = 'ai';
        } else {
          chatbotType = 'traditional';
        }
      }
      
      // Take a screenshot of the page
      const screenshot = await page.screenshot({ encoding: 'base64' });
      
      // Close the browser
      await browser.close();
      
      // Generate issues and recommendations
      const issues: string[] = [];
      const recommendations: string[] = [];
      
      if (!hasChatbot) {
        issues.push('No chatbot integration detected');
        recommendations.push('Consider adding a chatbot to improve user engagement and support');
      } else if (!chatbotVisibility) {
        issues.push('Chatbot is not visible on page load');
        recommendations.push('Make the chatbot more visible or add a prominent chat button');
      }
      
      if (chatbotType === 'traditional') {
        recommendations.push('Consider upgrading to an AI-powered chatbot for better user experience');
      }
      
      // Calculate score
      let score = 0;
      
      if (hasChatbot) {
        // Base score for having a chatbot
        score += 70;
        
        // Bonus for visibility
        if (chatbotVisibility) {
          score += 15;
        }
        
        // Bonus for AI chatbot
        if (chatbotType === 'ai') {
          score += 15;
        }
      }
      
      // Ensure score is between 0 and 100
      score = Math.max(0, Math.min(100, score));
      
      return {
        score,
        hasChatbot,
        chatbotType,
        chatbotProvider,
        chatbotPosition,
        chatbotVisibility,
        detectedElements: chatbotData.chatbotElements.length,
        detectedIframes: chatbotData.chatIframes,
        detectedScripts: chatbotData.chatbotScripts,
        keywordMatches: chatbotData.foundKeywords,
        screenshot,
        issues,
        recommendations,
      };
    } catch (error) {
      console.error('Error in chatbot integration analysis:', error);
      throw new Error(`Chatbot integration analysis failed: ${(error as Error).message}`);
    }
  }
}
