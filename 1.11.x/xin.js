const { type, name } = $arguments;

const compatible_outbound = { tag: 'COMPATIBLE', type: 'direct' };
let compatible = false;

let config = JSON.parse($files[0]);
let proxies = await produceArtifact({
    name,
    type: /^1$|col/i.test(type) ? 'collection' : 'subscription',
    platform: 'sing-box',
    produceType: 'internal',
});

config.outbounds.push(...proxies);

function getTags(proxies, regex) {
    return (regex ? proxies.filter(p => regex.test(p.tag)) : proxies).map(p => p.tag);
}

function getFirstSelectorTag(proxies) {
    const selectorProxy = proxies.find(p => p.type === 'selector');
    return selectorProxy ? selectorProxy.tag : null;
}

const firstSelectorTag = getFirstSelectorTag(proxies);

config.outbounds.map(i => {
    if (['all', 'all-auto'].includes(i.tag) && Array.isArray(i.outbounds)) {
        i.outbounds.push(...getTags(proxies));
    }
    if (i.tag === '手动选择' && Array.isArray(i.outbounds)) {
        i.outbounds.push(...getTags(proxies, /^(?!.*(?:国内|网站|地址|剩余|过期|时间|有效))/));
    }
    if (i.tag === '国内手动' && Array.isArray(i.outbounds)) {
        i.outbounds.push(...getTags(proxies, /国内/));
    }
    if (['自动选择'].includes(i.tag) && Array.isArray(i.outbounds)) {
        i.outbounds.push(...getTags(proxies, /^(?!.*(?:国内|网站|地址|剩余|过期|时间|有效))/));
    }
    if (i.tag.includes('国内自动') && Array.isArray(i.outbounds)) {
        i.outbounds.push(...getTags(proxies, /国内/));
    }
    if (['国内节点'].includes(i.tag) && Array.isArray(i.outbounds)) {
        i.outbounds.push(...getTags(proxies, /国内/i));
    }
    
    if (i.tag.includes('香港') && Array.isArray(i.outbounds)) {
        i.outbounds.push(...getTags(proxies, /港|hk|hongkong|hong kong/i));
    }
    if (i.tag.includes('台湾') && Array.isArray(i.outbounds)) {
        i.outbounds.push(...getTags(proxies, /台|tw|taiwan/i));
    }
    if (i.tag.includes('日本') && Array.isArray(i.outbounds)) {
        i.outbounds.push(...getTags(proxies, /日本|jp|japan/i));
    }
    if (i.tag.includes('新加坡') && Array.isArray(i.outbounds)) {
        i.outbounds.push(...getTags(proxies, /^(?!.*(?:us)).*(新|sg|singapore)/i));
    }
    if (i.tag.includes('美国') && Array.isArray(i.outbounds)) {
        i.outbounds.push(...getTags(proxies, /美|us|unitedstates|united states/i));
    }
    if (i.tag.includes('韩国') && Array.isArray(i.outbounds)) {
        i.outbounds.push(...getTags(proxies, /韩|kr|korea/i));
    }
    
    if ((['Netflix', 'Netflix-auto'].includes(i.tag) || i.tag.includes('Netflix')) && Array.isArray(i.outbounds)) {
        i.outbounds.push(...getTags(proxies, /nf|netflix/i));
    }
    if ((['Disney', 'Disney-auto'].includes(i.tag) || i.tag.includes('Disney')) && Array.isArray(i.outbounds)) {
        i.outbounds.push(...getTags(proxies, /disney|disneyplus/i));
    }
    if ((['Youtube', 'Youtube-auto'].includes(i.tag) || i.tag.includes('Youtube')) && Array.isArray(i.outbounds)) {
        i.outbounds.push(...getTags(proxies, /youtube|google/i));
    }
    if ((['Spotify', 'Spotify-auto'].includes(i.tag) || i.tag.includes('Spotify')) && Array.isArray(i.outbounds)) {
        i.outbounds.push(...getTags(proxies, /spotify/i));
    }
    if ((['OpenAI', 'OpenAI-auto'].includes(i.tag) || i.tag.includes('OpenAI')) && Array.isArray(i.outbounds)) {
        i.outbounds.push(...getTags(proxies, /openai|chatgpt/i));
    }
    if ((['Telegram', 'Telegram-auto'].includes(i.tag) || i.tag.includes('Telegram')) && Array.isArray(i.outbounds)) {
        i.outbounds.push(...getTags(proxies, /telegram|tg/i));
    }
    if (['my_selector'].includes(i.tag) && firstSelectorTag && Array.isArray(i.outbounds)) {
        i.outbounds.push(firstSelectorTag);
    }
});

config.outbounds.forEach(outbound => {
    if (Array.isArray(outbound.outbounds) && outbound.outbounds.length === 0) {
        if (!compatible) {
            config.outbounds.push(compatible_outbound);
            compatible = true;
        }
        outbound.outbounds.push(compatible_outbound.tag);
    }
});

$content = JSON.stringify(config, null, 2);
