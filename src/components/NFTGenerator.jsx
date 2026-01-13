import { useRef, useState } from 'react';
import {
  Upload,
  FolderOpen,
  Settings,
  Download,
  Play,
  Plus,
  Trash2,
  ChevronUp,
  ChevronDown,
} from 'lucide-react';

const NFTGenerator = () => {
  const [layers, setLayers] = useState([]);
  const [layerOrder, setLayerOrder] = useState([]);
  const [restrictions, setRestrictions] = useState([]);
  const [generatedNFTs, setGeneratedNFTs] = useState([]);
  const [generating, setGenerating] = useState(false);
  const [nftCount, setNftCount] = useState(10);
  const fileInputRef = useRef(null);

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

    setLayers(newLayers);
    setLayerOrder(newLayers.map((layer, index) => ({ name: layer.name, order: index })));
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

  const removeRestriction = (id) => {
    setRestrictions(restrictions.filter((restriction) => restriction.id !== id));
  };

  const updateRestriction = (id, field, value) => {
    setRestrictions(
      restrictions.map((restriction) =>
        restriction.id === id ? { ...restriction, [field]: value } : restriction
      )
    );
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

  const generateNFTs = async () => {
    if (layers.length === 0) {
      alert('Please upload layer folders first!');
      return;
    }

    setGenerating(true);
    const generated = [];
    const orderedLayers = [...layerOrder]
      .sort((a, b) => a.order - b.order)
      .map((order) => layers.find((layer) => layer.name === order.name))
      .filter(Boolean);

    console.log('Starting generation with layers:', orderedLayers.map((layer) => layer.name));

    let attempts = 0;
    const maxAttempts = nftCount * 100;

    while (generated.length < nftCount && attempts < maxAttempts) {
      attempts += 1;
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
      if (generated.some((item) => item.key === combinationKey)) continue;

      const canvas = document.createElement('canvas');
      canvas.width = 1000;
      canvas.height = 1000;
      const ctx = canvas.getContext('2d');

      try {
        for (const item of combination) {
          const img = await loadImageFromFile(item.trait.file);
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

        console.log(`Generated NFT ${generated.length}/${nftCount}`);
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
    setGenerating(false);
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
          <div className="lg:col-span-2 bg-white bg-opacity-10 backdrop-blur-lg rounded-xl p-6 border border-white border-opacity-20">
            <div className="flex items-center gap-2 mb-4">
              <FolderOpen className="text-blue-300" size={24} />
              <h2 className="text-2xl font-bold text-white">Upload Layers</h2>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              webkitdirectory="true"
              directory="true"
              multiple
              onChange={handleFolderUpload}
              className="hidden"
            />

            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-bold py-4 px-6 rounded-lg flex items-center justify-center gap-2 transition-all"
            >
              <Upload size={20} />
              Select Folder with Layers
            </button>

            {layers.length > 0 && (
              <div className="mt-6 space-y-4">
                <h3 className="text-xl font-bold text-white mb-3">Layer Order</h3>
                {layerOrder.map((order, index) => {
                  const layer = layers.find((item) => item.name === order.name);
                  return (
                    <div key={order.name} className="bg-white bg-opacity-10 p-4 rounded-lg">
                      <div className="flex items-center gap-4">
                        <div className="flex flex-col gap-1">
                          <button
                            onClick={() => moveLayerUp(order.name)}
                            disabled={index === 0}
                            className="bg-white bg-opacity-20 hover:bg-opacity-30 disabled:opacity-30 disabled:cursor-not-allowed text-white p-1 rounded transition-all"
                            title="Move up"
                          >
                            <ChevronUp size={20} />
                          </button>
                          <button
                            onClick={() => moveLayerDown(order.name)}
                            disabled={index === layerOrder.length - 1}
                            className="bg-white bg-opacity-20 hover:bg-opacity-30 disabled:opacity-30 disabled:cursor-not-allowed text-white p-1 rounded transition-all"
                            title="Move down"
                          >
                            <ChevronDown size={20} />
                          </button>
                        </div>
                        <input
                          type="number"
                          value={order.order}
                          onChange={(event) => updateLayerOrder(order.name, event.target.value)}
                          className="w-20 bg-white bg-opacity-20 text-white px-3 py-2 rounded border border-white border-opacity-30"
                          min="0"
                        />
                        <div className="flex-1">
                          <p className="text-white font-semibold">{order.name}</p>
                          <p className="text-blue-200 text-sm">{layer?.traits.length} traits</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="bg-white bg-opacity-10 backdrop-blur-lg rounded-xl p-6 border border-white border-opacity-20">
            <div className="flex items-center gap-2 mb-4">
              <Settings className="text-blue-300" size={24} />
              <h2 className="text-2xl font-bold text-white">Settings</h2>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-white block mb-2">Number of NFTs</label>
                <input
                  type="number"
                  value={nftCount}
                  onChange={(event) => setNftCount(parseInt(event.target.value, 10) || 1)}
                  className="w-full bg-white bg-opacity-20 text-white px-4 py-2 rounded border border-white border-opacity-30"
                  min="1"
                  max="10000"
                />
              </div>

              <button
                onClick={generateNFTs}
                disabled={generating || layers.length === 0}
                className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 disabled:from-gray-500 disabled:to-gray-600 text-white font-bold py-3 px-6 rounded-lg flex items-center justify-center gap-2 transition-all"
              >
                <Play size={20} />
                {generating ? 'Generating...' : 'Generate NFTs'}
              </button>

              {generatedNFTs.length > 0 && (
                <button
                  onClick={downloadAll}
                  className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white font-bold py-3 px-6 rounded-lg flex items-center justify-center gap-2 transition-all"
                >
                  <Download size={20} />
                  Download All
                </button>
              )}
            </div>
          </div>
        </div>

        {layers.length > 0 && (
          <div className="bg-white bg-opacity-10 backdrop-blur-lg rounded-xl p-6 border border-white border-opacity-20 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-white">Trait Restrictions</h2>
              <button
                onClick={addRestriction}
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-all"
              >
                <Plus size={20} />
                Add Rule
              </button>
            </div>

            <div className="space-y-4">
              {restrictions.map((restriction) => (
                <div
                  key={restriction.id}
                  className="bg-white bg-opacity-10 p-4 rounded-lg flex gap-4 items-center"
                >
                  <select
                    value={restriction.type}
                    onChange={(event) =>
                      updateRestriction(restriction.id, 'type', event.target.value)
                    }
                    className="bg-gray-800 text-white px-3 py-2 rounded border border-gray-600 focus:border-blue-400 focus:outline-none"
                    style={{ colorScheme: 'dark' }}
                  >
                    <option value="incompatible">Incompatible</option>
                    <option value="required">Required</option>
                  </select>

                  <select
                    value={restriction.layer1}
                    onChange={(event) =>
                      updateRestriction(restriction.id, 'layer1', event.target.value)
                    }
                    className="flex-1 bg-gray-800 text-white px-3 py-2 rounded border border-gray-600 focus:border-blue-400 focus:outline-none"
                    style={{ colorScheme: 'dark' }}
                  >
                    <option value="">Select Layer</option>
                    {layers.map((layer) => (
                      <option key={layer.name} value={layer.name}>
                        {layer.name}
                      </option>
                    ))}
                  </select>

                  <select
                    value={restriction.trait1}
                    onChange={(event) =>
                      updateRestriction(restriction.id, 'trait1', event.target.value)
                    }
                    className="flex-1 bg-gray-800 text-white px-3 py-2 rounded border border-gray-600 focus:border-blue-400 focus:outline-none disabled:opacity-50"
                    style={{ colorScheme: 'dark' }}
                    disabled={!restriction.layer1}
                  >
                    <option value="">Select Trait</option>
                    {layers
                      .find((layer) => layer.name === restriction.layer1)
                      ?.traits.map((trait) => (
                        <option key={trait.name} value={trait.name}>
                          {trait.name}
                        </option>
                      ))}
                  </select>

                  <span className="text-white font-bold">&</span>

                  <select
                    value={restriction.layer2}
                    onChange={(event) =>
                      updateRestriction(restriction.id, 'layer2', event.target.value)
                    }
                    className="flex-1 bg-gray-800 text-white px-3 py-2 rounded border border-gray-600 focus:border-blue-400 focus:outline-none"
                    style={{ colorScheme: 'dark' }}
                  >
                    <option value="">Select Layer</option>
                    {layers.map((layer) => (
                      <option key={layer.name} value={layer.name}>
                        {layer.name}
                      </option>
                    ))}
                  </select>

                  <select
                    value={restriction.trait2}
                    onChange={(event) =>
                      updateRestriction(restriction.id, 'trait2', event.target.value)
                    }
                    className="flex-1 bg-gray-800 text-white px-3 py-2 rounded border border-gray-600 focus:border-blue-400 focus:outline-none disabled:opacity-50"
                    style={{ colorScheme: 'dark' }}
                    disabled={!restriction.layer2}
                  >
                    <option value="">Select Trait</option>
                    {layers
                      .find((layer) => layer.name === restriction.layer2)
                      ?.traits.map((trait) => (
                        <option key={trait.name} value={trait.name}>
                          {trait.name}
                        </option>
                      ))}
                  </select>

                  <button
                    onClick={() => removeRestriction(restriction.id)}
                    className="bg-red-500 hover:bg-red-600 text-white p-2 rounded transition-all"
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {generatedNFTs.length > 0 && (
          <div className="bg-white bg-opacity-10 backdrop-blur-lg rounded-xl p-6 border border-white border-opacity-20">
            <h2 className="text-2xl font-bold text-white mb-4">
              Generated NFTs ({generatedNFTs.length})
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {generatedNFTs.map((nft) => (
                <div key={nft.id} className="bg-white bg-opacity-10 rounded-lg overflow-hidden">
                  <img
                    src={nft.image}
                    alt={`NFT ${nft.id}`}
                    className="w-full aspect-square object-cover"
                  />
                  <div className="p-3">
                    <p className="text-white font-semibold mb-2">NFT #{nft.id}</p>
                    <div className="flex gap-2">
                      <button
                        onClick={() => downloadNFT(nft)}
                        className="flex-1 bg-blue-500 hover:bg-blue-600 text-white text-sm py-2 rounded transition-all"
                      >
                        Image
                      </button>
                      <button
                        onClick={() => downloadMetadata(nft)}
                        className="flex-1 bg-purple-500 hover:bg-purple-600 text-white text-sm py-2 rounded transition-all"
                      >
                        JSON
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default NFTGenerator;
