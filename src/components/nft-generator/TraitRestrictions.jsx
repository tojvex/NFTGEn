import { Plus, Trash2 } from 'lucide-react';

const TraitRestrictions = ({
  restrictions,
  layers,
  onAddRestriction,
  onUpdateRestriction,
  onRemoveRestriction,
}) => {
  return (
    <div className="bg-white bg-opacity-10 backdrop-blur-lg rounded-xl p-6 border border-white border-opacity-20">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold text-white">Trait Restrictions</h2>
        <button
          onClick={onAddRestriction}
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
                onUpdateRestriction(restriction.id, 'type', event.target.value)
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
                onUpdateRestriction(restriction.id, 'layer1', event.target.value)
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
                onUpdateRestriction(restriction.id, 'trait1', event.target.value)
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
                onUpdateRestriction(restriction.id, 'layer2', event.target.value)
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
                onUpdateRestriction(restriction.id, 'trait2', event.target.value)
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
              onClick={() => onRemoveRestriction(restriction.id)}
              className="bg-red-500 hover:bg-red-600 text-white p-2 rounded transition-all"
            >
              <Trash2 size={20} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TraitRestrictions;
