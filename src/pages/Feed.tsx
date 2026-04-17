import { BottomNav } from "@/components/BottomNav";
import { ContractServiceDialog } from "@/components/ContractServiceDialog";
import { Navbar } from "@/components/Navbar";
import { OpportunityCard } from "@/components/OpportunityCard";
import { TalentCard } from "@/components/TalentCard";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { OPPORTUNITIES, TALENTS } from "@/lib/mock-data";
import { useAuthStore } from "@/store/authStore";
import { useMessagesStore } from "@/store/messagesStore";
import { useServiceStore } from "@/store/serviceStore";
import { motion } from "framer-motion";
import { useState } from "react";
import { Link } from "react-router-dom";

const Feed = () => {
  const { user: currentUser } = useAuthStore();
  const { getAllServices } = useServiceStore();
  const { conversations } = useMessagesStore();
  const allServices = getAllServices();
  const [selectedService, setSelectedService] = useState<any>(null);
  const [contractDialogOpen, setContractDialogOpen] = useState(false);

  // Si el usuario es freelancer, mostrar oportunidades
  // Si es cliente, mostrar talentos
  const isFreelancer = currentUser?.role === "freelancer";

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      <Navbar />
      <div className="container py-6 max-w-2xl">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Welcome Header */}
          <div className="bg-gradient-to-r from-primary/10 to-accent/10 rounded-2xl p-6 border border-primary/20">
            <h1 className="text-2xl font-display font-bold text-foreground mb-2">
              ¡Hola, {currentUser?.name}! 👋
            </h1>
            <p className="text-muted-foreground mb-4">
              {isFreelancer
                ? "Descubre oportunidades que se alinean con tus habilidades"
                : "Encuentra talento joven para tus proyectos"}
            </p>
            {isFreelancer && (
              <Link to="/servicios/nuevo">
                <Button size="sm" className="gradient-primary text-primary-foreground rounded-full">
                  + Publicar servicio
                </Button>
              </Link>
            )}
          </div>

          {/* Dashboard Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-card rounded-xl p-4 border border-border shadow-card"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">⭐ Rating</p>
                  <p className="text-2xl font-bold text-foreground mt-1">
                    {currentUser?.rating || "4.9"}
                  </p>
                </div>
                <div className="text-3xl">⭐</div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-card rounded-xl p-4 border border-border shadow-card"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">📊 {isFreelancer ? "Servicios" : "Contratos"}</p>
                  <p className="text-2xl font-bold text-primary mt-1">
                    {isFreelancer ? allServices.filter(s => s.userId === currentUser?.id).length : 0}
                  </p>
                </div>
                <div className="text-3xl">📊</div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-card rounded-xl p-4 border border-border shadow-card"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">💬 Mensajes</p>
                  <p className="text-2xl font-bold text-foreground mt-1">
                    {conversations.length || 0}
                  </p>
                </div>
                <div className="text-3xl">💬</div>
              </div>
            </motion.div>
          </div>

          {/* Recommended Section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="font-display font-semibold text-lg text-foreground">
                🎯 Recomendado para ti
              </h2>
              <Link to={isFreelancer ? "/explorar" : "/explorar"}>
                <Button variant="ghost" size="sm" className="text-primary hover:text-primary/80">
                  Ver más →
                </Button>
              </Link>
            </div>
            {isFreelancer ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {OPPORTUNITIES.slice(0, 2).map((opp) => (
                  <motion.div
                    key={opp.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-card rounded-xl p-4 border border-border hover:border-primary/50 transition-all cursor-pointer"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <p className="font-semibold text-foreground truncate">{opp.title}</p>
                        <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{opp.description}</p>
                        <p className="text-sm text-primary font-semibold mt-2">${opp.budget}</p>
                      </div>
                      <div className="text-xl">💼</div>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {TALENTS.slice(0, 3).map((talent) => (
                  <motion.div
                    key={talent.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-card rounded-xl p-3 border border-border hover:border-primary/50 transition-all text-center cursor-pointer group"
                  >
                    <img
                      src={talent.avatar}
                      alt={talent.name}
                      className="w-12 h-12 rounded-full mx-auto bg-muted group-hover:ring-2 group-hover:ring-primary transition-all"
                    />
                    <p className="font-semibold text-sm text-foreground mt-2 truncate">{talent.name}</p>
                    <p className="text-xs text-muted-foreground truncate">{talent.skills[0]}</p>
                    <div className="flex items-center justify-center gap-1 mt-1">
                      <span className="text-yellow-500">⭐</span>
                      <span className="text-xs text-muted-foreground">{talent.rating}</span>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>

          {/* Tabs */}
          <Tabs defaultValue={isFreelancer ? "oportunidades" : "talento"}>
            <TabsList className="w-full rounded-xl bg-muted h-11 mb-6">
              {isFreelancer && (
                <TabsTrigger
                  value="oportunidades"
                  className="flex-1 rounded-lg data-[state=active]:shadow-sm"
                >
                  🎯 Oportunidades
                </TabsTrigger>
              )}
              <TabsTrigger
                value="talento"
                className="flex-1 rounded-lg data-[state=active]:shadow-sm"
              >
                ⭐ Talento
              </TabsTrigger>
              {allServices.length > 0 && (
                <TabsTrigger
                  value="servicios"
                  className="flex-1 rounded-lg data-[state=active]:shadow-sm"
                >
                  💼 Servicios
                </TabsTrigger>
              )}
            </TabsList>

            {/* Opportunities */}
            {isFreelancer && (
              <TabsContent value="oportunidades" className="space-y-4">
                {OPPORTUNITIES.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-muted-foreground">
                      No hay oportunidades disponibles en este momento
                    </p>
                  </div>
                ) : (
                  OPPORTUNITIES.map((opp) => (
                    <OpportunityCard key={opp.id} opportunity={opp} />
                  ))
                )}
              </TabsContent>
            )}

            {/* Talents */}
            <TabsContent value="talento">
              <div className="grid grid-cols-2 gap-4 auto-rows-fr">
                {TALENTS.filter((t) => t.id !== currentUser?.id).map((talent) => (
                  <TalentCard key={talent.id} talent={talent} />
                ))}
              </div>
            </TabsContent>

            {/* User Services */}
            {allServices.length > 0 && (
              <TabsContent value="servicios" className="space-y-4">
                <p className="text-sm text-muted-foreground mb-4">
                  Servicios publicados: {allServices.length}
                </p>
                {allServices.filter(s => s.userId !== currentUser?.id).map((service) => (
                  <motion.div
                    key={service.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="rounded-2xl bg-card p-4 shadow-card hover:shadow-card-hover transition-all"
                  >
                    <div className="flex items-start justify-between gap-3 flex-wrap">
                      <div className="flex-1 min-w-[200px]">
                        <h3 className="font-display font-semibold text-foreground">
                          {service.title}
                        </h3>
                        <p className="text-sm text-muted-foreground mt-1">
                          {service.description}
                        </p>
                        <div className="flex gap-4 mt-3 text-sm flex-wrap">
                          <span className="text-primary font-semibold">
                            ${service.price}
                          </span>
                          <span className="text-muted-foreground">
                            {service.category}
                          </span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Link to={`/perfil/${service.userId}`}>
                          <Button
                            variant="outline"
                            size="sm"
                            className="rounded-full"
                          >
                            Ver perfil
                          </Button>
                        </Link>
                        {currentUser?.role === "client" && (
                          <Button
                            size="sm"
                            onClick={() => {
                              setSelectedService(service);
                              setContractDialogOpen(true);
                            }}
                            className="gradient-primary text-primary-foreground rounded-full shadow-primary-glow"
                          >
                            Contratar
                          </Button>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
                {allServices.filter(s => s.userId !== currentUser?.id).length === 0 && (
                  <div className="text-center py-12">
                    <p className="text-muted-foreground">
                      No hay servicios disponibles en este momento
                    </p>
                  </div>
                )}
              </TabsContent>
            )}
          </Tabs>

          {/* Contract Dialog */}
          {selectedService && (() => {
            // Buscar el freelancer que ofrece el servicio
            const freelancer = TALENTS.find(t => t.id === selectedService.userId);
            if (!freelancer) return null;
            return (
              <ContractServiceDialog
                open={contractDialogOpen}
                onOpenChange={setContractDialogOpen}
                service={selectedService}
                freelancer={freelancer}
              />
            );
          })()}
        </motion.div>
      </div>
      <BottomNav />
    </div>
  );
};

export default Feed;
