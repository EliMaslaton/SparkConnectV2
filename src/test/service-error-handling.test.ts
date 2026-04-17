import { serviceApi } from "@/services/serviceApi";
import { useServiceStore } from "@/store/serviceStore";
import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";

describe("Service Error Handling System", () => {
  beforeEach(() => {
    // Limpiar estado antes de cada test
  });

  describe("serviceApi", () => {
    it("debe retornar false cuando no encuentra un servicio", async () => {
      const response = await serviceApi.getServiceById("nonexistent_123");
      expect(response.success).toBe(false);
    });

    it("debe detectar servicios eliminados", async () => {
      const serviceId = "service_to_delete";
      serviceApi.markServiceAsDeleted(serviceId);
      
      const response = await serviceApi.getServiceById(serviceId);
      expect(response.error).toBe("deleted");
    });

    it("debe retornar razones específicas de error", () => {
      const serviceId = "deleted_service";
      serviceApi.markServiceAsDeleted(serviceId);
      
      const reason = serviceApi.getNotFoundReason(serviceId);
      expect(reason.type).toBe("deleted");
      expect(reason.message).toContain("eliminado");
    });

    it("debe retornar estado de conexión", () => {
      const status = serviceApi.getConnectionStatus();
      expect(status).toHaveProperty("isOnline");
      expect(status).toHaveProperty("lastCheck");
    });
  });

  describe("serviceStore", () => {
    it("debe obtener servicio por ID", () => {
      const { result } = renderHook(() => useServiceStore());
      
      act(() => {
        result.current.addService({
          userId: "user_1",
          title: "Test Service",
          description: "Test Description",
          category: "Test",
          price: "100",
        });
      });

      const services = result.current.getAllServices();
      const testService = services[services.length - 1];
      
      const retrieved = result.current.getServiceById(testService.id);
      expect(retrieved).toBeDefined();
      expect(retrieved?.title).toBe("Test Service");
    });

    it("debe obtener sugerencias por categoría", () => {
      const { result } = renderHook(() => useServiceStore());
      
      act(() => {
        result.current.addService({
          userId: "user_1",
          title: "Service A",
          description: "Desc",
          category: "Design",
          price: "50",
        });
        result.current.addService({
          userId: "user_2",
          title: "Service B",
          description: "Desc",
          category: "Design",
          price: "60",
        });
        result.current.addService({
          userId: "user_3",
          title: "Service C",
          description: "Desc",
          category: "Development",
          price: "70",
        });
      });

      const suggestions = result.current.getSuggestedServices("Design", undefined, 2);
      expect(suggestions.length).toBeLessThanOrEqual(2);
      expect(suggestions.every(s => s.category === "Design")).toBe(true);
    });

    it("debe buscar servicios por palabra clave", () => {
      const { result } = renderHook(() => useServiceStore());
      
      act(() => {
        result.current.addService({
          userId: "user_1",
          title: "React Development",
          description: "Build web apps with React",
          category: "Development",
          price: "100",
        });
        result.current.addService({
          userId: "user_2",
          title: "Vue Development",
          description: "Build with Vue",
          category: "Development",
          price: "80",
        });
      });

      const results = result.current.findServicesByKeyword("React");
      expect(results.length).toBeGreaterThan(0);
      expect(results[0].title).toContain("React");
    });

    it("debe obtener múltiples servicios por IDs", () => {
      const { result } = renderHook(() => useServiceStore());
      
      let ids: string[] = [];
      
      act(() => {
        for (let i = 0; i < 3; i++) {
          result.current.addService({
            userId: `user_${i}`,
            title: `Service ${i}`,
            description: "Test",
            category: "Test",
            price: "50",
          });
        }
        ids = result.current.getAllServices().map(s => s.id);
      });

      const retrieved = result.current.getServicesByIds(ids.slice(0, 2));
      expect(retrieved.length).toBe(2);
    });
  });

  describe("Error Messages", () => {
    it("debe mostrar mensaje apropiado para ID inválido", () => {
      const reason = serviceApi.getNotFoundReason("");
      expect(reason.type).toBe("never-existed");
    });

    it("debe mostrar mensaje para servicio eliminado", () => {
      const id = "deleted_service_123";
      serviceApi.markServiceAsDeleted(id);
      
      const reason = serviceApi.getNotFoundReason(id);
      expect(reason.type).toBe("deleted");
      expect(reason.message).toContain("eliminado");
    });
  });
});
