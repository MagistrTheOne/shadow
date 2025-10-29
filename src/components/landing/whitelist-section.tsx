"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2, Mail, Building2, User, MessageSquare, Calendar } from "lucide-react";
import { useLanguage } from "@/contexts/language-context";
import { toast } from "sonner";

export const WhitelistSection = () => {
  const { t } = useLanguage();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    company: "",
    email: "",
    request: ""
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/whitelist", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error("Failed to submit");
      }

      toast.success(t('whitelist.success'));
      setFormData({ name: "", company: "", email: "", request: "" });
    } catch (error) {
      console.error("Error submitting whitelist:", error);
      toast.error(t('whitelist.error'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="whitelist" className="py-20 relative">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-white/5 backdrop-blur-sm mb-6">
            <Calendar className="w-4 h-4 text-cyan-400 mr-2" />
            <span className="text-sm text-gray-300">{t('whitelist.badge')}</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            {t('whitelist.title')}
          </h2>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto mb-4">
            {t('whitelist.subtitle')}
          </p>
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-cyan-400/10 border border-cyan-400/20 text-cyan-300 text-sm backdrop-blur-sm">
            <Calendar className="w-4 h-4 mr-2" />
            <span>{t('whitelist.dropDate')}</span>
          </div>
        </div>

        {/* Form Card */}
        <Card className="bg-white/5 backdrop-blur-sm border-white/10">
          <CardHeader className="p-6">
            <CardTitle className="text-2xl text-white">{t('whitelist.formTitle')}</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Name */}
              <div className="space-y-2">
                <Label htmlFor="name" className="text-gray-300 flex items-center gap-2">
                  <User className="w-4 h-4" />
                  {t('whitelist.name')}
                </Label>
                <Input
                  id="name"
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="bg-white/5 border-white/10 text-white placeholder:text-gray-500"
                  placeholder={t('whitelist.namePlaceholder')}
                />
              </div>

              {/* Company */}
              <div className="space-y-2">
                <Label htmlFor="company" className="text-gray-300 flex items-center gap-2">
                  <Building2 className="w-4 h-4" />
                  {t('whitelist.company')}
                </Label>
                <Input
                  id="company"
                  type="text"
                  required
                  value={formData.company}
                  onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                  className="bg-white/5 border-white/10 text-white placeholder:text-gray-500"
                  placeholder={t('whitelist.companyPlaceholder')}
                />
              </div>

              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email" className="text-gray-300 flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  {t('whitelist.email')}
                </Label>
                <Input
                  id="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="bg-white/5 border-white/10 text-white placeholder:text-gray-500"
                  placeholder={t('whitelist.emailPlaceholder')}
                />
              </div>

              {/* Request */}
              <div className="space-y-2">
                <Label htmlFor="request" className="text-gray-300 flex items-center gap-2">
                  <MessageSquare className="w-4 h-4" />
                  {t('whitelist.request')}
                </Label>
                <Textarea
                  id="request"
                  required
                  rows={5}
                  value={formData.request}
                  onChange={(e) => setFormData({ ...formData, request: e.target.value })}
                  className="bg-white/5 border-white/10 text-white placeholder:text-gray-500 resize-none"
                  placeholder={t('whitelist.requestPlaceholder')}
                />
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-cyan-400 hover:bg-cyan-500 text-black font-semibold py-6 text-lg"
              >
                {isSubmitting ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                    {t('whitelist.submitting')}
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5" />
                    {t('whitelist.submit')}
                  </div>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Info */}
        <div className="mt-8 text-center">
          <p className="text-gray-400 text-sm">
            {t('whitelist.info')}
          </p>
        </div>
      </div>
    </section>
  );
};

