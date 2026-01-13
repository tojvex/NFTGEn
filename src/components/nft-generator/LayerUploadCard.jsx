import { useEffect, useRef, useState } from 'react';
import { ChevronDown, ChevronUp, FolderOpen, Upload } from 'lucide-react';

const LayerUploadCard = ({
  layers,
  layerOrder,
  onUpload,
  onMoveLayerUp,
  onMoveLayerDown,
  onUpdateLayerOrder,
  collapseSignal,
}) => {
  const fileInputRef = useRef(null);
  const [showLayerOrder, setShowLayerOrder] = useState(false);

  useEffect(() => {
    setShowLayerOrder(false);
  }, [collapseSignal]);

  return (
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
        onChange={onUpload}
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
        <div className="mt-4">
          <button
            type="button"
            onClick={() => setShowLayerOrder((current) => !current)}
            className="px-3 py-1 rounded bg-white bg-opacity-10 hover:bg-opacity-20 text-white text-sm transition-all"
          >
            {showLayerOrder ? 'Hide Layer Order' : 'Show Layer Order'}
          </button>

          {showLayerOrder && (
            <div className="mt-4 space-y-4">
              {layerOrder.map((order, index) => {
                const layer = layers.find((item) => item.name === order.name);
                return (
                  <div key={order.name} className="bg-white bg-opacity-10 p-4 rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className="flex flex-col gap-1">
                        <button
                          onClick={() => onMoveLayerUp(order.name)}
                          disabled={index === 0}
                          className="bg-white bg-opacity-20 hover:bg-opacity-30 disabled:opacity-30 disabled:cursor-not-allowed text-white p-1 rounded transition-all"
                          title="Move up"
                        >
                          <ChevronUp size={20} />
                        </button>
                        <button
                          onClick={() => onMoveLayerDown(order.name)}
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
                        onChange={(event) => onUpdateLayerOrder(order.name, event.target.value)}
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
      )}
    </div>
  );
};

export default LayerUploadCard;
