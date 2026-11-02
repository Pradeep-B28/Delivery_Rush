// Inline SVG icons for food, vehicles, structures, and UI elements.
// Uses no external dependencies.
// Used by city.js, actors.js, order cards, and screens.

export const FOOD_ICONS = {
  biryani: `
    <g class="food-icon icon-biryani">
      <path d="M7 16 C7 23 23 23 23 16 Z" fill="#D97706" />
      <path d="M6 16 C6 13 24 13 24 16 Z" fill="#F59E0B" />
      <ellipse cx="15" cy="15" rx="8" ry="3" fill="#FDE68A" />
      <path d="M12 14 Q15 11 18 14" stroke="#D97706" stroke-width="1.5" fill="none" stroke-linecap="round"/>
      <circle cx="15" cy="13" r="1.5" fill="#10B981" />
      <path d="M13 10 Q14 7 13 6" stroke="#94A3B8" stroke-width="1.2" fill="none" stroke-linecap="round"/>
      <path d="M17 10 Q18 7 17 6" stroke="#94A3B8" stroke-width="1.2" fill="none" stroke-linecap="round"/>
    </g>`,

  dosa: `
    <g class="food-icon icon-dosa">
      <ellipse cx="15" cy="20" rx="12" ry="5" fill="#047857" opacity="0.6"/>
      <path d="M5 19 C8 11 22 11 25 19 Z" fill="#D97706" />
      <path d="M7 18 C10 13 20 13 23 18 Z" fill="#FBBF24" />
      <circle cx="9" cy="20" r="2.5" fill="#FFFFFF"/>
      <circle cx="9" cy="20" r="1.5" fill="#EF4444"/>
      <circle cx="21" cy="20" r="2.5" fill="#FFFFFF"/>
      <circle cx="21" cy="20" r="1.5" fill="#10B981"/>
    </g>`,

  coffee: `
    <g class="food-icon icon-coffee">
      <path d="M6 21 C6 24 24 24 24 21 L22 18 L8 18 Z" fill="#94A3B8" />
      <path d="M9 18 L11 8 L19 8 L21 18 Z" fill="#CBD5E1" />
      <ellipse cx="15" cy="8" rx="4" ry="1.5" fill="#78350F" />
      <ellipse cx="15" cy="7.5" rx="3.5" ry="1.2" fill="#FDE68A" />
      <path d="M13 5 Q14 2 13 1" stroke="#94A3B8" stroke-width="1.2" fill="none" stroke-linecap="round"/>
      <path d="M17 5 Q18 2 17 1" stroke="#94A3B8" stroke-width="1.2" fill="none" stroke-linecap="round"/>
    </g>`,

  curry: `
    <g class="food-icon icon-curry">
      <path d="M6 15 C6 23 24 23 24 15 Z" fill="#B45309" />
      <ellipse cx="15" cy="15" rx="9" ry="3.5" fill="#DC2626" />
      <ellipse cx="15" cy="15" rx="7" ry="2.5" fill="#EA580C" />
      <circle cx="14" cy="14" r="1.5" fill="#34D399" />
      <circle cx="16.5" cy="15" r="1.2" fill="#FDE68A" />
      <path d="M15 10 Q16 7 15 6" stroke="#94A3B8" stroke-width="1.2" fill="none" stroke-linecap="round"/>
    </g>`,

  grill: `
    <g class="food-icon icon-grill">
      <line x1="5" y1="23" x2="25" y2="7" stroke="#64748B" stroke-width="2" stroke-linecap="round"/>
      <rect x="8" y="15" width="5" height="5" rx="1.5" transform="rotate(-40 10.5 17.5)" fill="#B45309" />
      <rect x="13" y="11" width="5" height="5" rx="1.5" transform="rotate(-40 15.5 13.5)" fill="#EA580C" />
      <rect x="18" y="7" width="5" height="5" rx="1.5" transform="rotate(-40 20.5 9.5)" fill="#EF4444" />
      <circle cx="11" cy="18" r="0.8" fill="#111827"/>
      <circle cx="16" cy="14" r="0.8" fill="#111827"/>
    </g>`,

  icecream: `
    <g class="food-icon icon-icecream">
      <path d="M11 16 L15 25 L19 16 Z" fill="#D97706" />
      <circle cx="15" cy="14" r="5" fill="#F472B6" />
      <circle cx="13" cy="11" r="3.5" fill="#34D399" />
      <circle cx="17" cy="10" r="3" fill="#FBBF24" />
      <circle cx="15" cy="7" r="1.8" fill="#EF4444" />
    </g>`
};

export function getFoodSvg(iconName, size = 24) {
  const content = FOOD_ICONS[iconName] || FOOD_ICONS.dosa;
  return `<svg width="${size}" height="${size}" viewBox="0 0 30 30" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">${content}</svg>`;
}

export function getHouseSvg(color = "var(--warn)", size = 26) {
  return `
    <svg width="${size}" height="${size}" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg" class="actor-house" aria-hidden="true">
      <ellipse cx="14" cy="24" rx="10" ry="3" fill="rgba(0,0,0,0.2)"/>
      <path d="M5 14 L14 5 L23 14 L21 14 L21 23 L7 23 L7 14 Z" fill="var(--surface, #FFFFFF)" stroke="${color}" stroke-width="2" stroke-linejoin="round"/>
      <path d="M3 14 L14 4 L25 14" stroke="${color}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
      <rect x="19" y="6" width="2.5" height="4" fill="${color}"/>
      <rect x="11.5" y="16" width="5" height="7" rx="1" fill="${color}"/>
      <circle cx="14" cy="11" r="2" fill="${color}" opacity="0.3"/>
    </svg>`;
}

export function getBarrierSvg(size = 30) {
  return `
    <svg width="${size}" height="${size}" viewBox="0 0 32 20" fill="none" xmlns="http://www.w3.org/2000/svg" class="flood-barrier" aria-hidden="true">
      <defs>
        <pattern id="barrierStripes" width="8" height="8" patternTransform="rotate(45 0 0)" patternUnits="userSpaceOnUse">
          <line x1="0" y1="0" x2="0" y2="8" stroke="#EF4444" stroke-width="4" />
          <line x1="4" y1="0" x2="4" y2="8" stroke="#FFFFFF" stroke-width="4" />
        </pattern>
      </defs>
      <!-- Base posts -->
      <line x1="5" y1="6" x2="5" y2="18" stroke="#334155" stroke-width="3" stroke-linecap="round"/>
      <line x1="27" y1="6" x2="27" y2="18" stroke="#334155" stroke-width="3" stroke-linecap="round"/>
      <!-- Striped barrier board -->
      <rect x="2" y="7" width="28" height="7" rx="1.5" fill="url(#barrierStripes)" stroke="#B91C1C" stroke-width="1"/>
      <circle cx="4" cy="10.5" r="1.2" fill="#FBBF24"/>
      <circle cx="28" cy="10.5" r="1.2" fill="#FBBF24"/>
    </svg>`;
}

export function getScooterSvg(color = "var(--rider-1)", badgeNumber = 1, hasFood = false, dir = 1) {
  const flip = dir < 0 ? 'transform="scale(-1, 1) translate(-34, 0)"' : '';
  const steam = hasFood
    ? `<path d="M7 6 Q8 3 7 1" stroke="#CBD5E1" stroke-width="1.2" fill="none" stroke-linecap="round"/>
       <path d="M10 6 Q11 3 10 1" stroke="#CBD5E1" stroke-width="1.2" fill="none" stroke-linecap="round"/>`
    : "";

  return `
    <svg width="34" height="34" viewBox="0 0 34 34" fill="none" xmlns="http://www.w3.org/2000/svg" class="rider-scooter" aria-hidden="true">
      <g ${flip}>
        <!-- Shadow -->
        <ellipse cx="17" cy="30" rx="13" ry="2.5" fill="rgba(0,0,0,0.25)"/>
        
        <!-- Steam when carrying food -->
        ${steam}

        <!-- Delivery Box on the back -->
        <rect x="4" y="9" width="11" height="11" rx="2" fill="${color}" stroke="#FFFFFF" stroke-width="1.5"/>
        <!-- Number Badge inside box -->
        <circle cx="9.5" cy="14.5" r="3.5" fill="#FFFFFF"/>
        <text x="9.5" y="17" font-size="7" font-weight="900" font-family="sans-serif" text-anchor="middle" fill="#0F172A">${badgeNumber}</text>

        <!-- Scooter body and chassis -->
        <path d="M14 17 L22 17 L25 11" stroke="${color}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
        <!-- Handlebar and Headlight -->
        <path d="M23 9 L25 12" stroke="#FFFFFF" stroke-width="1.5" stroke-linecap="round"/>
        <circle cx="26" cy="12" r="1.8" fill="#FDE68A" stroke="#FFFFFF" stroke-width="0.8"/>
        
        <!-- Wheels -->
        <circle cx="8" cy="24" r="4" fill="#1E293B" stroke="#FFFFFF" stroke-width="1.2"/>
        <circle cx="8" cy="24" r="1.5" fill="#94A3B8"/>
        <circle cx="24" cy="24" r="4" fill="#1E293B" stroke="#FFFFFF" stroke-width="1.2"/>
        <circle cx="24" cy="24" r="1.5" fill="#94A3B8"/>
        
        <!-- Mudguards / base plate -->
        <path d="M5 21 C8 19 12 19 14 21" stroke="#CBD5E1" stroke-width="1.2" fill="none"/>
        <path d="M21 21 C24 19 27 19 28 21" stroke="#CBD5E1" stroke-width="1.2" fill="none"/>
      </g>
    </svg>`;
}
