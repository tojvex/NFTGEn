import { useMemo, useRef, useState } from 'react';
import GeneratedNFTs from './nft-generator/GeneratedNFTs';
import GroupedDependencies from './nft-generator/GroupedDependencies';
import LayerUploadCard from './nft-generator/LayerUploadCard';
import SettingsCard from './nft-generator/SettingsCard';
import TraitRestrictions from './nft-generator/TraitRestrictions';
import UniquenessCard from './nft-generator/UniquenessCard';

const NFTGenerator = () => {
  const [layers, setLayers] = useState([]);
  const [layerOrder, setLayerOrder] = useState([]);
  const [restrictions, setRestrictions] = useState([]);
  const [groupRules, setGroupRules] = useState([]);
  const [groupDependenciesExpanded, setGroupDependenciesExpanded] = useState(true);
  const [generatedNFTs, setGeneratedNFTs] = useState([]);
  const [generating, setGenerating] = useState(false);
  const [nftCount, setNftCount] = useState(10);
  const [preferredLayerOrder, setPreferredLayerOrder] = useState([]);
  const [layerOrderCollapseKey, setLayerOrderCollapseKey] = useState(0);
  const [generationProgress, setGenerationProgress] = useState({
    generated: 0,
    total: 0,
  });
  const imageCacheRef = useRef(new Map());

  const formatCompactNumber = (value) => {
    if (value === null || value === undefined) return 'n/a';
    const str = value.toString();
    if (str.length <= 6) {
      return str.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    }
    const mantissa = `${str[0]}.${str.slice(1, 3)}`;
    return `${mantissa}e+${str.length - 1}`;
  };

  const uniquenessStats = useMemo(() => {
    if (layers.length === 0) {
      return {
        possibleCombinations: null,
        diversityScore: null,
        similarityScore: null,
        coverage: [],
      };
    }

    let possibleCombinations = 1n;
    layers.forEach((layer) => {
      const count = Math.max(layer.traits.length, 1);
      possibleCombinations *= BigInt(count);
    });

    if (generatedNFTs.length === 0) {
      return {
        possibleCombinations,
        diversityScore: null,
        similarityScore: null,
        coverage: [],
      };
    }

    const total = generatedNFTs.length;
    const countsByLayer = {};
    layers.forEach((layer) => {
      countsByLayer[layer.name] = {};
    });

    generatedNFTs.forEach((nft) => {
      (nft.metadata?.attributes || []).forEach((attribute) => {
        const layerName = attribute.trait_type;
        const traitName = attribute.value;
        if (!countsByLayer[layerName]) {
          countsByLayer[layerName] = {};
        }
        countsByLayer[layerName][traitName] =
          (countsByLayer[layerName][traitName] || 0) + 1;
      });
    });

    const perLayerMatch = layers.map((layer) => {
      const counts = countsByLayer[layer.name] || {};
      const values = Object.values(counts);
      if (values.length === 0) return 1;
      return values.reduce((sum, count) => {
        const share = count / total;
        return sum + share * share;
      }, 0);
    });

    const avgMatch =
      perLayerMatch.reduce((sum, value) => sum + value, 0) / layers.length;
    const diversityScore = Math.max(0, Math.min(1, 1 - avgMatch));

    const coverage = layers.map((layer) => {
      const counts = countsByLayer[layer.name] || {};
      const usedTraits = Object.keys(counts).length;
      const totalTraits = Math.max(layer.traits.length, 1);
      let topTrait = null;
      let topCount = 0;

      Object.entries(counts).forEach(([name, count]) => {
        if (count > topCount) {
          topTrait = name;
          topCount = count;
        }
      });

      return {
        name: layer.name,
        usedTraits,
        totalTraits,
        coverageRatio: usedTraits / totalTraits,
        topTrait,
        topShare: total ? topCount / total : 0,
      };
    });

    return {
      possibleCombinations,
      diversityScore,
      similarityScore: avgMatch,
      coverage,
    };
  }, [generatedNFTs, layers]);

  const diversityPercent =
    uniquenessStats?.diversityScore !== null && uniquenessStats?.diversityScore !== undefined
      ? Math.round(uniquenessStats.diversityScore * 100)
      : null;
  const similarityLabel =
    diversityPercent === null
      ? null
      : diversityPercent >= 75
        ? 'Low'
        : diversityPercent >= 55
          ? 'Medium'
          : 'High';
  const similarityColor =
    diversityPercent === null
      ? 'text-blue-200'
      : diversityPercent >= 75
        ? 'text-emerald-300'
        : diversityPercent >= 55
          ? 'text-amber-300'
          : 'text-rose-300';
  const uniquenessBarClass =
    diversityPercent === null
      ? 'from-blue-400 to-indigo-500'
      : diversityPercent >= 75
        ? 'from-emerald-400 to-teal-500'
        : diversityPercent >= 55
          ? 'from-amber-400 to-orange-500'
          : 'from-rose-400 to-red-500';
  const requestedExceedsPossible =
    uniquenessStats?.possibleCombinations !== null &&
    uniquenessStats?.possibleCombinations !== undefined &&
    BigInt(nftCount) > uniquenessStats.possibleCombinations;
  const progressPercent =
    generationProgress.total > 0
      ? Math.min(
          100,
          Math.round((generationProgress.generated / generationProgress.total) * 100)
        )
      : 0;

  const handleFolderUpload = async (e) => {
    const files = Array.from(e.target.files || []);
    const layerMap = {};

    console.log('Total files uploaded:', files.length);

    files.forEach((file) => {
      const pathParts = file.webkitRelativePath.split('/');
      console.log('File path:', file.webkitRelativePath, 'Parts:', pathParts.length);

      if (pathParts.length >= 2) {
        const layerName = pathParts.length === 2 ? pathParts[0] : pathParts[1];
        const fileName = pathParts[pathParts.length - 1];

        if (fileName.match(/\.(png|jpg|jpeg|gif|svg|webp)$/i)) {
          if (!layerMap[layerName]) {
            layerMap[layerName] = {
              name: layerName,
              traits: [],
            };
          }

          const traitName = fileName.replace(/\.(png|jpg|jpeg|gif|svg|webp)$/i, '');
          const rarityMatch = traitName.match(/#(\d+)$/);
          const rarity = rarityMatch ? parseInt(rarityMatch[1], 10) : 1;
          const cleanName = traitName.replace(/#\d+$/, '');

          layerMap[layerName].traits.push({
            name: cleanName,
            file,
            rarity,
            url: URL.createObjectURL(file),
          });
        }
      }
    });

    const newLayers = Object.values(layerMap);
    console.log('Processed layers:', newLayers);

    if (newLayers.length === 0) {
      alert(
        'No valid image layers found! Please make sure your folder contains subfolders with image files (PNG, JPG, GIF, SVG, WEBP).'
      );
      return;
    }

    imageCacheRef.current = new Map();
    setLayers(newLayers);
    setLayerOrder(buildLayerOrder(newLayers, preferredLayerOrder));
  };

  const updateLayerOrder = (layerName, newOrder) => {
    const updated = layerOrder.map((layer) =>
      layer.name === layerName ? { ...layer, order: parseInt(newOrder, 10) } : layer
    );
    setLayerOrder(updated.sort((a, b) => a.order - b.order));
  };

  const moveLayerUp = (layerName) => {
    const currentIndex = layerOrder.findIndex((layer) => layer.name === layerName);
    if (currentIndex > 0) {
      const newOrder = [...layerOrder];
      [newOrder[currentIndex], newOrder[currentIndex - 1]] = [
        newOrder[currentIndex - 1],
        newOrder[currentIndex],
      ];
      newOrder.forEach((layer, index) => {
        layer.order = index;
      });
      setLayerOrder(newOrder);
    }
  };

  const moveLayerDown = (layerName) => {
    const currentIndex = layerOrder.findIndex((layer) => layer.name === layerName);
    if (currentIndex < layerOrder.length - 1) {
      const newOrder = [...layerOrder];
      [newOrder[currentIndex], newOrder[currentIndex + 1]] = [
        newOrder[currentIndex + 1],
        newOrder[currentIndex],
      ];
      newOrder.forEach((layer, index) => {
        layer.order = index;
      });
      setLayerOrder(newOrder);
    }
  };

  const addRestriction = () => {
    setRestrictions([
      ...restrictions,
      {
        id: Date.now(),
        layer1: '',
        trait1: '',
        layer2: '',
        trait2: '',
        type: 'incompatible',
      },
    ]);
  };

  const addGroupRule = () => {
    setGroupRules([
      ...groupRules,
      {
        id: Date.now(),
        sourceLayer: '',
        sourceTraits: [],
        targetLayer: '',
        targetTraits: [],
        mode: 'require',
      },
    ]);
  };

  const removeRestriction = (id) => {
    setRestrictions(restrictions.filter((restriction) => restriction.id !== id));
  };

  const removeGroupRule = (id) => {
    setGroupRules(groupRules.filter((rule) => rule.id !== id));
  };

  const updateRestriction = (id, field, value) => {
    setRestrictions(
      restrictions.map((restriction) =>
        restriction.id === id ? { ...restriction, [field]: value } : restriction
      )
    );
  };

  const updateGroupRule = (id, field, value) => {
    setGroupRules(
      groupRules.map((rule) => {
        if (rule.id !== id) return rule;
        if (field === 'sourceLayer') {
          return { ...rule, sourceLayer: value, sourceTraits: [] };
        }
        if (field === 'targetLayer') {
          return { ...rule, targetLayer: value, targetTraits: [] };
        }
        return { ...rule, [field]: value };
      })
    );
  };

  const normalizeTraitArray = (value) => {
    if (!value) return [];
    if (Array.isArray(value)) {
      return value.filter((item) => typeof item === 'string' && item.trim());
    }
    if (typeof value === 'string') {
      return value
        .split(',')
        .map((item) => item.trim())
        .filter(Boolean);
    }
    return [];
  };

  function normalizeLayerOrderNames(value) {
    if (!Array.isArray(value)) return [];
    return value
      .map((item) => {
        if (typeof item === 'string') return item;
        if (item && typeof item === 'object') {
          return item.name || item.layer || item.layerName || '';
        }
        return '';
      })
      .map((name) => name.trim())
      .filter(Boolean);
  }

  function normalizeGroupRuleMode(value) {
    if (typeof value !== 'string') return null;
    const cleaned = value.trim().toLowerCase();
    if (cleaned === 'exclude' || cleaned === 'excluded' || cleaned === 'forbid' || cleaned === 'ban') {
      return 'exclude';
    }
    if (cleaned === 'require' || cleaned === 'required') {
      return 'require';
    }
    return null;
  }

  function getGroupRuleMode(rule) {
    if (rule?.then?.exclude === true || rule?.exclude === true) {
      return 'exclude';
    }
    const candidates = [
      rule?.then?.type,
      rule?.then?.mode,
      rule?.then?.action,
      rule?.type,
      rule?.mode,
      rule?.action,
    ];
    for (const candidate of candidates) {
      const normalized = normalizeGroupRuleMode(candidate);
      if (normalized) return normalized;
    }
    return 'require';
  }

  function buildLayerOrder(layersList, orderedNames) {
    if (!Array.isArray(layersList) || layersList.length === 0) return [];
    const fallback = layersList.map((layer, index) => ({ name: layer.name, order: index }));
    if (!Array.isArray(orderedNames) || orderedNames.length === 0) return fallback;

    const nameOrder = new Map();
    orderedNames.forEach((name, index) => {
      const key = name.toLowerCase();
      if (!nameOrder.has(key)) {
        nameOrder.set(key, index);
      }
    });

    let nextOrder = nameOrder.size;
    const ordered = layersList.map((layer) => {
      const key = layer.name.toLowerCase();
      if (nameOrder.has(key)) {
        return { name: layer.name, order: nameOrder.get(key) };
      }
      return { name: layer.name, order: nextOrder++ };
    });

    return ordered.sort((a, b) => a.order - b.order);
  }

  const normalizeRuleSet = (data) => {
    const rawRestrictions = Array.isArray(data?.restrictions) ? data.restrictions : [];
    const rawGroupRules = Array.isArray(data?.groupRules)
      ? data.groupRules
      : Array.isArray(data?.dependencies)
        ? data.dependencies
        : [];
    const rawLayerOrder = Array.isArray(data?.layersOrder)
      ? data.layersOrder
      : Array.isArray(data?.layerOrder)
        ? data.layerOrder
        : Array.isArray(data?.layersorder)
          ? data.layersorder
          : [];

    const restrictions = rawRestrictions
      .filter((item) => item && typeof item === 'object')
      .map((item, index) => ({
        id: Date.now() + index,
        type: item.type === 'required' ? 'required' : 'incompatible',
        layer1: item.layer1 || '',
        trait1: item.trait1 || '',
        layer2: item.layer2 || '',
        trait2: item.trait2 || '',
      }))
      .filter(
        (item) =>
          item.layer1 ||
          item.trait1 ||
          item.layer2 ||
          item.trait2
      );

    const groupRules = rawGroupRules
      .filter((item) => item && typeof item === 'object')
      .map((item, index) => {
        if (item.if && item.then) {
          return {
            id: Date.now() + index,
            mode: getGroupRuleMode(item),
            sourceLayer: item.if.layer || '',
            sourceTraits: normalizeTraitArray(item.if.traits),
            targetLayer: item.then.layer || '',
            targetTraits: normalizeTraitArray(item.then.traits),
          };
        }

        return {
          id: Date.now() + index,
          mode: getGroupRuleMode(item),
          sourceLayer: item.sourceLayer || '',
          sourceTraits: normalizeTraitArray(item.sourceTraits),
          targetLayer: item.targetLayer || '',
          targetTraits: normalizeTraitArray(item.targetTraits),
        };
      })
      .filter(
        (rule) =>
          rule.sourceLayer ||
          rule.targetLayer ||
          rule.sourceTraits.length > 0 ||
          rule.targetTraits.length > 0
      );

    return {
      restrictions,
      groupRules,
      layerOrderNames: normalizeLayerOrderNames(rawLayerOrder),
    };
  };

  const toggleGroupRuleTrait = (id, field, traitName) => {
    setGroupRules(
      groupRules.map((rule) => {
        if (rule.id !== id) return rule;
        const current = rule[field] || [];
        const next = current.includes(traitName)
          ? current.filter((name) => name !== traitName)
          : [...current, traitName];
        return { ...rule, [field]: next };
      })
    );
  };

  const setGroupRuleTraits = (id, field, traits) => {
    setGroupRules(
      groupRules.map((rule) => (rule.id === id ? { ...rule, [field]: traits } : rule))
    );
  };

  const handleRulesImport = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (loadEvent) => {
      try {
        const text = loadEvent.target?.result || '';
        const parsed = JSON.parse(text);
        const {
          restrictions: importedRestrictions,
          groupRules: importedGroupRules,
          layerOrderNames,
        } = normalizeRuleSet(parsed);

        setRestrictions(importedRestrictions);
        setGroupRules(importedGroupRules);
        setPreferredLayerOrder(layerOrderNames);
        if (layers.length > 0 && layerOrderNames.length > 0) {
          setLayerOrder(buildLayerOrder(layers, layerOrderNames));
        }
        setGroupDependenciesExpanded(false);
      } catch (error) {
        console.error('Failed to import rules:', error);
        alert('Invalid rules JSON. Please check the file format.');
      }
    };
    reader.readAsText(file);
    event.target.value = '';
  };

  const exportRules = () => {
    const payload = {
      groupRules: groupRules.map((rule) => ({
        sourceLayer: rule.sourceLayer,
        sourceTraits: rule.sourceTraits,
        targetLayer: rule.targetLayer,
        targetTraits: rule.targetTraits,
        type: rule.mode === 'exclude' ? 'exclude' : 'require',
      })),
      restrictions: restrictions.map((rule) => ({
        type: rule.type,
        layer1: rule.layer1,
        trait1: rule.trait1,
        layer2: rule.layer2,
        trait2: rule.trait2,
      })),
    };

    const dataStr = JSON.stringify(payload, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.download = 'nft-rules.json';
    link.href = url;
    link.click();
    URL.revokeObjectURL(url);
  };

  const checkRestrictions = (combination) => {
    for (const restriction of restrictions) {
      const trait1 = combination.find(
        (item) =>
          item.layerName === restriction.layer1 && item.traitName === restriction.trait1
      );
      const trait2 = combination.find(
        (item) =>
          item.layerName === restriction.layer2 && item.traitName === restriction.trait2
      );

      if (restriction.type === 'incompatible' && trait1 && trait2) {
        return false;
      }
      if (restriction.type === 'required' && trait1 && !trait2) {
        return false;
      }
    }

    for (const rule of groupRules) {
      if (
        !rule.sourceLayer ||
        !rule.targetLayer ||
        rule.sourceTraits.length === 0 ||
        rule.targetTraits.length === 0
      ) {
        continue;
      }

      const sourceTrait = combination.find((item) => item.layerName === rule.sourceLayer);
      const targetTrait = combination.find((item) => item.layerName === rule.targetLayer);

      if (!sourceTrait || !targetTrait) continue;

      if (rule.mode === 'exclude') {
        if (
          rule.sourceTraits.includes(sourceTrait.traitName) &&
          rule.targetTraits.includes(targetTrait.traitName)
        ) {
          return false;
        }
      } else {
        if (
          rule.sourceTraits.includes(sourceTrait.traitName) &&
          !rule.targetTraits.includes(targetTrait.traitName)
        ) {
          return false;
        }
      }
    }

    return true;
  };

  const selectTraitByRarity = (traits) => {
    const totalRarity = traits.reduce((sum, trait) => sum + trait.rarity, 0);
    let random = Math.random() * totalRarity;

    for (const trait of traits) {
      random -= trait.rarity;
      if (random <= 0) return trait;
    }
    return traits[traits.length - 1];
  };

  const loadImageFromUrl = (url, label) => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = (err) => {
        console.error('Failed to load image:', label || url, err);
        reject(err);
      };
      img.src = url;
    });
  };

  const loadImageFromFile = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = (err) => {
          console.error('Failed to load image:', file.name, err);
          reject(err);
        };
        img.src = e.target.result;
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const loadTraitImage = async (trait) => {
    if (!trait) return null;
    const cacheKey = trait.url || trait.file;
    if (imageCacheRef.current.has(cacheKey)) {
      return imageCacheRef.current.get(cacheKey);
    }

    const loader = (async () => {
      if (typeof createImageBitmap === 'function' && trait.file) {
        try {
          return await createImageBitmap(trait.file);
        } catch (error) {
          console.warn('Falling back to Image element for', trait.name, error);
        }
      }
      if (trait.url) {
        return await loadImageFromUrl(trait.url, trait.name);
      }
      if (trait.file) {
        return await loadImageFromFile(trait.file);
      }
      return null;
    })();

    imageCacheRef.current.set(cacheKey, loader);
    return loader;
  };

  const generateNFTs = async () => {
    if (layers.length === 0) {
      alert('Please upload layer folders first!');
      return;
    }

    const targetCount = Math.max(1, Number(nftCount) || 1);
    const maxAttempts = targetCount * 100;

    setGenerating(true);
    setGeneratedNFTs([]);
    setGenerationProgress({
      generated: 0,
      total: targetCount,
    });

    await new Promise((resolve) => setTimeout(resolve, 0));

    const generated = [];
    const seenKeys = new Set();
    const orderedLayers = [...layerOrder]
      .sort((a, b) => a.order - b.order)
      .map((order) => layers.find((layer) => layer.name === order.name))
      .filter(Boolean);

    console.log('Starting generation with layers:', orderedLayers.map((layer) => layer.name));

    const canvas = document.createElement('canvas');
    canvas.width = 1000;
    canvas.height = 1000;
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      console.error('Failed to create canvas context for generation.');
      setGenerating(false);
      return;
    }

    let attempts = 0;
    const progressUpdateInterval = 25;

    while (generated.length < targetCount && attempts < maxAttempts) {
      attempts += 1;

      if (attempts % progressUpdateInterval === 0) {
        await new Promise((resolve) => setTimeout(resolve, 0));
      }
      const combination = [];

      for (const layer of orderedLayers) {
        const trait = selectTraitByRarity(layer.traits);
        combination.push({
          layerName: layer.name,
          traitName: trait.name,
          trait,
        });
      }

      if (!checkRestrictions(combination)) continue;

      const combinationKey = combination
        .map((item) => `${item.layerName}-${item.traitName}`)
        .join('|');
      if (seenKeys.has(combinationKey)) continue;
      seenKeys.add(combinationKey);

      try {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        for (const item of combination) {
          const img = await loadTraitImage(item.trait);
          if (!img) {
            throw new Error(`Missing image for trait ${item.trait?.name || ''}`);
          }
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        }

        const imageData = canvas.toDataURL('image/png');
        const metadata = {
          name: `NFT #${generated.length + 1}`,
          description: 'Generated NFT',
          attributes: combination.map((item) => ({
            trait_type: item.layerName,
            value: item.traitName,
          })),
        };

        generated.push({
          id: generated.length + 1,
          key: combinationKey,
          image: imageData,
          metadata,
        });

        setGenerationProgress((current) => ({
          ...current,
          generated: generated.length,
        }));
        await new Promise((resolve) => setTimeout(resolve, 0));

        console.log(`Generated NFT ${generated.length}/${targetCount}`);
      } catch (error) {
        console.error('Error generating NFT:', error);
        console.error(
          'Failed combination:',
          combination.map((item) => `${item.layerName}/${item.traitName}`)
        );
      }
    }

    console.log(`Generation complete: ${generated.length} NFTs created`);
    setGeneratedNFTs(generated);
    setGenerationProgress((current) => ({
      ...current,
      generated: generated.length,
    }));
    setGenerating(false);
    setLayerOrderCollapseKey((value) => value + 1);
  };

  const downloadNFT = (nft) => {
    const link = document.createElement('a');
    link.download = `nft-${nft.id}.png`;
    link.href = nft.image;
    link.click();
  };

  const downloadMetadata = (nft) => {
    const dataStr = JSON.stringify(nft.metadata, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.download = `metadata-${nft.id}.json`;
    link.href = url;
    link.click();
    URL.revokeObjectURL(url);
  };

  const downloadAll = () => {
    generatedNFTs.forEach((nft) => {
      setTimeout(() => {
        downloadNFT(nft);
        downloadMetadata(nft);
      }, nft.id * 100);
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold text-white mb-2">NFT Generator</h1>
          <p className="text-blue-200">Upload layers, set order, and generate unique NFTs</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <LayerUploadCard
            layers={layers}
            layerOrder={layerOrder}
            onUpload={handleFolderUpload}
            onMoveLayerUp={moveLayerUp}
            onMoveLayerDown={moveLayerDown}
            onUpdateLayerOrder={updateLayerOrder}
            collapseSignal={layerOrderCollapseKey}
          />

          <div className="space-y-6">
            <SettingsCard
              nftCount={nftCount}
              onNftCountChange={(event) =>
                setNftCount(parseInt(event.target.value, 10) || 1)
              }
              onGenerate={generateNFTs}
              generating={generating}
              layersCount={layers.length}
              generatedCount={generatedNFTs.length}
              onDownloadAll={downloadAll}
              generationProgress={generationProgress}
              progressPercent={progressPercent}
            />

            <UniquenessCard
              layers={layers}
              uniquenessStats={uniquenessStats}
              diversityPercent={diversityPercent}
              similarityLabel={similarityLabel}
              similarityColor={similarityColor}
              uniquenessBarClass={uniquenessBarClass}
              requestedExceedsPossible={requestedExceedsPossible}
              formatCompactNumber={formatCompactNumber}
            />
          </div>
        </div>

        {layers.length > 0 && (
          <div className="space-y-6 mb-6">
            <TraitRestrictions
              restrictions={restrictions}
              layers={layers}
              onAddRestriction={addRestriction}
              onUpdateRestriction={updateRestriction}
              onRemoveRestriction={removeRestriction}
            />

            <GroupedDependencies
              groupRules={groupRules}
              layers={layers}
              onAddGroupRule={addGroupRule}
              onRemoveGroupRule={removeGroupRule}
              onUpdateGroupRule={updateGroupRule}
              onToggleTrait={toggleGroupRuleTrait}
              onSetTraits={setGroupRuleTraits}
              onImportRules={handleRulesImport}
              onExportRules={exportRules}
              exportDisabled={groupRules.length === 0 && restrictions.length === 0}
              expanded={groupDependenciesExpanded}
              onToggle={() =>
                setGroupDependenciesExpanded((current) => !current)
              }
            />
          </div>
        )}

        {generatedNFTs.length > 0 && (
          <GeneratedNFTs
            generatedNFTs={generatedNFTs}
            onDownloadNFT={downloadNFT}
            onDownloadMetadata={downloadMetadata}
          />
        )}
      </div>
    </div>
  );
};

export default NFTGenerator;
