export interface ModelInfo {
  name: string;
  model: string;
  modified_at: string;
  size: number;
  digest: string;
  details: {
    parent_model: string;
    format: string;
    family: string;
    families: string[];
    parameter_size: string;
  };
}

export interface ModelsResponse {
  success: boolean;
  message: string;
  models: ModelInfo[];
}
