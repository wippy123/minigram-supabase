import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { LLMModel, LLMModelConfig } from "@/lib/models";
import { TemplateId, Templates } from "@/lib/templates";
import Image from "next/image";

// Helper function to group models by provider
function groupModelsByProvider(models: LLMModel[]): Record<string, LLMModel[]> {
  return models.reduce(
    (acc, model) => {
      if (!acc[model.provider]) {
        acc[model.provider] = [];
      }
      acc[model.provider].push(model);
      return acc;
    },
    {} as Record<string, LLMModel[]>
  );
}

export function ChatPicker({
  templates,
  selectedTemplate,
  onSelectedTemplateChange,
  models,
  languageModel,
  onLanguageModelChange,
}: {
  templates: Templates;
  selectedTemplate: "auto" | TemplateId;
  onSelectedTemplateChange: (template: "auto" | TemplateId) => void;
  models: LLMModel[];
  languageModel: LLMModelConfig;
  onLanguageModelChange: (config: LLMModelConfig) => void;
}) {
  const groupedModels = groupModelsByProvider(models);

  return (
    <div className="flex items-center space-x-2">
      <TemplateSelect
        templates={templates}
        selectedTemplate={selectedTemplate}
        onSelectedTemplateChange={onSelectedTemplateChange}
      />
      <LanguageModelSelect
        groupedModels={groupedModels}
        languageModel={languageModel}
        onLanguageModelChange={onLanguageModelChange}
      />
    </div>
  );
}

function TemplateSelect({
  templates,
  selectedTemplate,
  onSelectedTemplateChange,
}: {
  templates: Templates;
  selectedTemplate: "auto" | TemplateId;
  onSelectedTemplateChange: (template: "auto" | TemplateId) => void;
}) {
  return (
    <div className="flex flex-col">
      <Select
        name="template"
        defaultValue={selectedTemplate}
        onValueChange={onSelectedTemplateChange}
      >
        <SelectTrigger className="whitespace-nowrap border-none shadow-none focus:ring-0 px-0 py-0 h-6 text-xs">
          <SelectValue placeholder="Select a persona" />
        </SelectTrigger>
        <SelectContent side="top">
          <SelectGroup>
            <SelectLabel>Persona</SelectLabel>
            {Object.entries(templates).map(([templateId, template]) => (
              <SelectItem key={templateId} value={templateId}>
                <div className="flex items-center space-x-2">
                  <Image
                    className="flex"
                    src={`/thirdparty/templates/${templateId}.svg`}
                    alt={templateId}
                    width={14}
                    height={14}
                  />
                  <span>{template.name}</span>
                </div>
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
    </div>
  );
}

function LanguageModelSelect({
  groupedModels,
  languageModel,
  onLanguageModelChange,
}: {
  groupedModels: Record<string, LLMModel[]>;
  languageModel: LLMModelConfig;
  onLanguageModelChange: (config: LLMModelConfig) => void;
}) {
  return (
    <div className="flex flex-col">
      <Select
        name="languageModel"
        defaultValue={languageModel.model}
        onValueChange={(e) => onLanguageModelChange({ model: e })}
      >
        <SelectTrigger className="whitespace-nowrap border-none shadow-none focus:ring-0 px-0 py-0 h-6 text-xs">
          <SelectValue placeholder="Language model" />
        </SelectTrigger>
        <SelectContent>
          {Object.entries(groupedModels).map(([provider, models]) => (
            <SelectGroup key={provider}>
              <SelectLabel>{provider}</SelectLabel>
              {models.map((model) => (
                <SelectItem key={model.id} value={model.id}>
                  <div className="flex items-center space-x-2">
                    <Image
                      className="flex"
                      src={`/thirdparty/logos/${model.providerId}.svg`}
                      alt={model.provider}
                      width={14}
                      height={14}
                    />
                    <span>{model.name}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectGroup>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
